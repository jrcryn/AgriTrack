import ExcelJS from 'exceljs';
import { logAction } from '../utils/logAction.js';

// Normalize date to YYYY-MM-DD (local)
const toDateKey = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const monthToRange = (month) => {
  // month: 'YYYY-MM'
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) throw new Error('Invalid month format. Use YYYY-MM.');
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 1, 0, 0, 0, 0); // exclusive
  return { start, end };
};

const getRangeFromQuery = (req) => {
  const { month, startDate, endDate } = req.query;
  if (month) return monthToRange(month);
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new Error('Invalid startDate/endDate range.');
    }
    // Make end exclusive next-day 00:00
    const endExclusive = new Date(end);
    endExclusive.setDate(endExclusive.getDate() + 1);
    endExclusive.setHours(0, 0, 0, 0);
    return { start, end: endExclusive };
  }
  // default: current month
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return monthToRange(monthStr);
};

const monthKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2,'0')}`;
};
const monthLabel = (key) => {
  const [y,m] = key.split('-').map(Number);
  return `${new Date(y, m-1, 1).toLocaleString('en-US',{ month:'short'})}-${y}`;
};
const fullMonthName = (key) => {
  const [y,m] = key.split('-').map(Number);
  return `${new Date(y, m-1, 1).toLocaleString('en-US',{ month:'long'})} ${y}`;
};

export const exportMachineriesUsageReport = async (req, res) => {
  try {
    const { start, end } = getRangeFromQuery(req);

    // Completed or partially-completed tickets finished in range
    const ticketFilter = {
      status: { $in: ['Completed', 'Partially Completed'] },
      'completionProof.completedAt': { $gte: start, $lt: end }
    };

    // Completed extension tickets in range
    const extensionFilter = {
      status: 'Completed',
      'completionProof.completedAt': { $gte: start, $lt: end }
    };

    const [tickets, extensions] = await Promise.all([
      global.machineriesModels.TicketRequest.find(ticketFilter).lean(),
      global.machineriesModels.ExtensionTicket.find(extensionFilter).lean()
    ]);

    // Map parents for extensions
    const parentIds = [];
    extensions.forEach(e => {
      if (e.parentRequestTicketId) parentIds.push(e.parentRequestTicketId);
      if (e.parentTicketId) parentIds.push(e.parentTicketId);
    });
    const parents = parentIds.length
      ? await global.machineriesModels.TicketRequest.find({ _id: { $in: parentIds }}).lean()
      : [];
    const parentMap = {};
    parents.forEach(p => parentMap[p._id.toString()] = p);

    // Normalizers
    const buildFarmerName = (f) => [f?.first_name, f?.middle_name, f?.surname].filter(Boolean).join(' ');
    const normTicket = (t) => ({
      isExtension: false,
      completedAt: t.completionProof?.completedAt ? new Date(t.completionProof.completedAt) : null,
      farmerName: buildFarmerName(t.requestorFarmer || {}),
      farmerBarangay: t.barangay || '',
      farmLocation: t.barangay || '', // no separate location field provided
      area: t.estimatedArea ?? null
    });
    const normExtension = (e) => {
      const parent = parentMap[e.parentRequestTicketId?.toString()] || parentMap[e.parentTicketId?.toString()];
      return {
        isExtension: true,
        completedAt: e.completionProof?.completedAt ? new Date(e.completionProof.completedAt) : null,
        farmerName: parent ? buildFarmerName(parent.requestorFarmer || {}) : '',
        farmerBarangay: parent?.barangay || '',
        farmLocation: parent?.barangay || '',
        area: e.remainingArea ?? null // requested: use remaining area as serviced portion for extension
      };
    };

    const allRows = [
      ...tickets.map(normTicket).filter(r => r.completedAt),
      ...extensions.map(normExtension).filter(r => r.completedAt)
    ];

    // Group by month
    const monthGroups = {};
    allRows.forEach(r => {
      const key = monthKey(r.completedAt);
      if (!monthGroups[key]) monthGroups[key] = [];
      monthGroups[key].push(r);
    });

    const workbook = new ExcelJS.Workbook();
    const periodLabel = `${toDateKey(start)} to ${toDateKey(new Date(end.getTime()-1))}`;

    // Summary sheet (high-level)
    const wsSummary = workbook.addWorksheet('Summary');
    wsSummary.addRow(['Machinery Monthly Usage Report', '']);
    wsSummary.mergeCells('A1','E1');
    wsSummary.getCell('A1').font = { size: 16, bold: true };
    wsSummary.getCell('A1').alignment = { horizontal: 'center' };
    wsSummary.addRow(['Period:', periodLabel]);
    wsSummary.addRow(['Total Months Covered:', Object.keys(monthGroups).length]);
    wsSummary.addRow(['Total Completed Tickets:', tickets.length]);
    wsSummary.addRow(['Total Completed Extensions:', extensions.length]);
    wsSummary.addRow(['Grand Total Entries:', allRows.length]);
    wsSummary.columns = [
      { header: '', key: 'c1', width: 28 },
      { header: '', key: 'c2', width: 35 },
      { header: '', key: 'c3', width: 18 },
      { header: '', key: 'c4', width: 18 },
      { header: '', key: 'c5', width: 18 },
    ];

    // Style summary rows
    wsSummary.eachRow((row,i)=>{
      row.eachCell(cell=>{
        if (i>1) cell.border = { top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'} };
      });
    });

    // Per-month sheets
    for (const key of Object.keys(monthGroups).sort()) {
      const rows = monthGroups[key].sort((a,b)=>a.completedAt - b.completedAt);
      const sheetName = monthLabel(key);
      const ws = workbook.addWorksheet(sheetName);

      // Columns
      ws.columns = [
        { header: 'Month', key: 'month', width: 14 },
        { header: 'Farmer Name', key: 'farmerName', width: 28 },
        { header: 'Farmer Barangay', key: 'farmerBarangay', width: 20 },
        { header: 'Farm Location', key: 'farmLocation', width: 22 },
        { header: 'Area (hectares)', key: 'area', width: 16 },
        { header: 'Type', key: 'type', width: 14 },
      ];

      // Title row
      ws.addRow([fullMonthName(key)]);
      ws.mergeCells(1,1,1,ws.columns.length);
      const titleCell = ws.getCell('A1');
      titleCell.font = { bold: true, size: 18 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFBDD7EE' } };
      ws.getRow(1).height = 28;

      // Header row
      ws.addRow(ws.columns.map(c => c.header));
      const headerRow = ws.getRow(2);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal:'center', vertical:'middle' };
      headerRow.height = 22;
      headerRow.eachCell(cell=>{
        cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF92D050' } };
        cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
      });

      // Data rows
      rows.forEach(r => {
        ws.addRow({
          month: fullMonthName(key),
          farmerName: r.farmerName,
            farmerBarangay: r.farmerBarangay,
          farmLocation: r.farmLocation,
          area: r.area ?? '',
          type: r.isExtension ? 'Extension' : 'Ticket'
        });
      });

      // Style data
      for (let i=3;i<=ws.rowCount;i++){
        const row = ws.getRow(i);
        row.eachCell((cell,col)=>{
          cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
          if (col===5) cell.alignment = { horizontal:'center' };
          else cell.alignment = { horizontal:'left' };
        });
      }

      // Barangay summary
      const barangayCounts = {};
      rows.forEach(r => {
        barangayCounts[r.farmerBarangay] = (barangayCounts[r.farmerBarangay]||0)+1;
      });

      ws.addRow([]); // spacer
      const summaryHeaderRowIndex = ws.rowCount + 1;
      ws.addRow(['Barangay Coverage Summary','','','','','']);
      ws.mergeCells(summaryHeaderRowIndex,1,summaryHeaderRowIndex,ws.columns.length);
      const shCell = ws.getCell(summaryHeaderRowIndex,1);
      shCell.font = { bold:true, size:14 };
      shCell.alignment = { horizontal:'center' };
      shCell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFCD5B4' } };
      shCell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };

      // Summary table headers
      ws.addRow(['Barangay', 'Completed Entries', '', '', '', '']);
      const bh = ws.getRow(ws.rowCount);
      bh.eachCell((cell, idx)=>{
        if (idx <= 2) {
          cell.font = { bold: true };
          cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFEEECE1' } };
        }
        cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
        cell.alignment = { horizontal:'center' };
      });

      Object.keys(barangayCounts).sort((a,b)=>barangayCounts[b]-barangayCounts[a]).forEach(b=>{
        ws.addRow([b, barangayCounts[b], '', '', '', '']);
        const row = ws.getRow(ws.rowCount);
        row.eachCell((cell, idx)=>{
          if (idx <= 2) {
            cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
            cell.alignment = { horizontal: idx===1 ? 'left':'center' };
          }
        });
      });

      // Auto-fit (bounded)
      ws.columns.forEach(col=>{
        let max = col.width;
        col.eachCell({ includeEmpty:true }, cell=>{
          const valLen = cell.value ? cell.value.toString().length : 0;
          if (valLen + 2 > max) max = valLen + 2;
        });
        col.width = Math.min(Math.max(12, max), 32);
      });
    }

    // Filename
    const filenameHint = `${toDateKey(start)}_${toDateKey(new Date(end.getTime()-1))}`;
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition',`attachment; filename="machinery-monthly-report-${filenameHint}.xlsx"`);
    await workbook.xlsx.write(res);
    
    // Log successful report generation
    await logAction(req, req.userId, 'MACHINERY_USAGE_REPORT_GENERATED', 'machineries', `Machinery usage report generated for period ${periodLabel}`, 'SUCCESS');
    
    res.end();
  } catch (error) {
    console.error('Monthly report generation error:', error);
    await logAction(req, req.userId || 'UNKNOWN', 'MACHINERY_USAGE_REPORT_GENERATED', 'machineries', `Failed to generate machinery usage report: ${error.message}`, 'FAILED');
    res.status(500).json({ success:false, message:'Error generating monthly report.', error: error.message });
  }
};

