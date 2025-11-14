import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import productionReportCommodities from '../../utils/productionReportCommodities.js';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get available date ranges for a specific year and month
export const getAvailableDateRanges = async (req, res) => {
  const { year, month } = req.params;
  
  if (!year || isNaN(parseInt(year)) || !month || isNaN(parseInt(month))) {
    return res.status(400).json({ message: 'Valid year and month parameters are required' });
  }
  
  try {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    // Get the appropriate model for this year
    const UnifiedFarmerRecordModel = global.getUnifiedFarmerRecordModel(yearNum);
    
    // Define month boundaries
    const startOfMonth = new Date(yearNum, monthNum - 1, 1);
    const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
    
    // Get all plantation and harvest date ranges within this month
    const plantationRanges = await UnifiedFarmerRecordModel.find({
      crop_stage: "NEWLY PLANTED",
      $or: [
        // Plantation starts in this month
        { plantation_start_date: { $gte: startOfMonth, $lte: endOfMonth } },
        // Plantation ends in this month
        { plantation_end_date: { $gte: startOfMonth, $lte: endOfMonth } },
        // Plantation spans this month
        { 
          plantation_start_date: { $lt: startOfMonth },
          plantation_end_date: { $gt: endOfMonth }
        }
      ]
    }).select('plantation_start_date plantation_end_date').lean();
    
    const harvestRanges = await UnifiedFarmerRecordModel.find({
      crop_stage: "HARVESTING",
      $or: [
        // Harvest starts in this month
        { harvest_start_date: { $gte: startOfMonth, $lte: endOfMonth } },
        // Harvest ends in this month
        { harvest_end_date: { $gte: startOfMonth, $lte: endOfMonth } },
        // Harvest spans this month
        { 
          harvest_start_date: { $lt: startOfMonth },
          harvest_end_date: { $gt: endOfMonth }
        }
      ]
    }).select('harvest_start_date harvest_end_date').lean();
    
    // Extract and normalize all date ranges
    const allDateRanges = [];
    
    // Add plantation date ranges
    plantationRanges.forEach(range => {
      if (range.plantation_start_date && range.plantation_end_date) {
        // Clamp dates to month boundaries if they extend beyond
        const startDate = range.plantation_start_date < startOfMonth ? startOfMonth : range.plantation_start_date;
        const endDate = range.plantation_end_date > endOfMonth ? endOfMonth : range.plantation_end_date;
        
        allDateRanges.push({
          startDate: startDate,
          endDate: endDate
        });
      }
    });
    
    // Add harvest date ranges
    harvestRanges.forEach(range => {
      if (range.harvest_start_date && range.harvest_end_date) {
        // Clamp dates to month boundaries if they extend beyond
        const startDate = range.harvest_start_date < startOfMonth ? startOfMonth : range.harvest_start_date;
        const endDate = range.harvest_end_date > endOfMonth ? endOfMonth : range.harvest_end_date;
        
        allDateRanges.push({
          startDate: startDate,
          endDate: endDate
        });
      }
    });
    
    // If no specific date ranges found, default to 1-15 and 16-end of month
    if (allDateRanges.length === 0) {
      const midMonth = new Date(yearNum, monthNum - 1, 15);
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      
      allDateRanges.push(
        {
          startDate: startOfMonth,
          endDate: midMonth
        },
        {
          startDate: new Date(yearNum, monthNum - 1, 16),
          endDate: endOfMonth
        }
      );
    } else {
      // Sort and merge overlapping date ranges
      allDateRanges.sort((a, b) => a.startDate - b.startDate);
      
      const mergedRanges = [];
      let currentRange = allDateRanges[0];
      
      for (let i = 1; i < allDateRanges.length; i++) {
        const nextRange = allDateRanges[i];
        
        if (currentRange.endDate >= nextRange.startDate) {
          // Ranges overlap, merge them
          currentRange.endDate = new Date(Math.max(currentRange.endDate, nextRange.endDate));
        } else {
          // No overlap, add current range to result and continue with next
          mergedRanges.push(currentRange);
          currentRange = nextRange;
        }
      }
      
      // Add the last range
      mergedRanges.push(currentRange);
      
      // Format response
      const formattedRanges = mergedRanges.map((range, index) => ({
        id: index + 1,
        label: `${range.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${range.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        startDate: range.startDate.toISOString().split('T')[0],
        endDate: range.endDate.toISOString().split('T')[0],
      }));
      
      return res.json(formattedRanges);
    }
    
    // Format the default ranges
    const formattedRanges = allDateRanges.map((range, index) => ({
      id: index + 1,
      label: `${range.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${range.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      startDate: range.startDate.toISOString().split('T')[0],
      endDate: range.endDate.toISOString().split('T')[0],
    }));
    
    res.json(formattedRanges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching date ranges', error: error.message });
  }
};


//gagawa ng controller dedicated for fetching available barangays wihtin the selected year and month, ayun ang ibibigay sa genReports.js controller na parameters pang gawa ng bi-weekly reports
export const getAvailableBarangays = async (req, res) => {
  const { year, month } = req.params;

  const yearNum = Number(year);
  const monthNum = Number(month);

  if (!Number.isInteger(yearNum) || !Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    return res.status(400).json({ message: 'Valid year and month parameters are required' });
  }

  try {
    // Month boundaries (local time, consistent with the rest of this file)
    const startOfMonth = new Date(yearNum, monthNum - 1, 1);
    const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    const UnifiedFarmerRecordModel = global.getUnifiedFarmerRecordModel(yearNum);

    // Match any record whose plantation/harvest dates overlap the month
    const filter = {
      $or: [
        {
          crop_stage: 'NEWLY PLANTED',
          $or: [
            { plantation_start_date: { $gte: startOfMonth, $lte: endOfMonth } },
            { plantation_end_date: { $gte: startOfMonth, $lte: endOfMonth } },
            {
              plantation_start_date: { $lt: startOfMonth },
              plantation_end_date: { $gt: endOfMonth },
            },
          ],
        },
        {
          crop_stage: 'HARVESTING',
          $or: [
            { harvest_start_date: { $gte: startOfMonth, $lte: endOfMonth } },
            { harvest_end_date: { $gte: startOfMonth, $lte: endOfMonth } },
            {
              harvest_start_date: { $lt: startOfMonth },
              harvest_end_date: { $gt: endOfMonth },
            },
          ],
        },
      ],
    };

    // If your schema uses a different field for barangay, replace 'farm_location' accordingly.
    const barangays = await UnifiedFarmerRecordModel.distinct('farm_location', filter);

    const cleaned = barangays
      .filter(Boolean)
      .map(v => String(v).trim())
      .filter(v => v.length > 0)
      .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

    return res.json(cleaned);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching available barangays', error: error.message });
  }
};


// Generate Excel report based on date range
export const generateHVCSaMPR = async (req, res) => {
  const { startDate, endDate } = req.body;
  
  if (!startDate || !endDate ) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }
  
  try {
    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59); // Include the entire end day

    // Use the start date to get the year
    const year = start.getFullYear();

    // Build the template file path
    const templatePath = path.resolve(__dirname, '../../templates/Supply and Market Profile Report Template.xlsx');
    
    // Check if the template exists
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ message: 'Template file not found' });
    }
    
    // Load the workbook from the template
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    
    // Assume the first worksheet is the target
    const worksheet = workbook.getWorksheet(1);
  

    // Query data from the database based on the date range
    const UnifiedFarmerRecordModel = global.getUnifiedFarmerRecordModel(year);
    const FarmerAccountModel = global.globalModels.FarmerAccount;

    const records = await UnifiedFarmerRecordModel.find({
      $or: [
        {
          crop_stage: 'HARVESTING',
          $or: [
            { harvest_start_date: { $lte: end, $gte: start } },
            { harvest_end_date: { $lte: end, $gte: start } },
            {
              harvest_start_date: { $lt: start },
              harvest_end_date: { $gt: end }
            }
          ]
        },
        {
          crop_stage: 'NEWLY PLANTED',
          $or: [
            { plantation_start_date: { $lte: end, $gte: start } },
            { plantation_end_date: { $lte: end, $gte: start } },
            {
              plantation_start_date: { $lt: start },
              plantation_end_date: { $gt: end }
            }
          ]
        }
      ]
    }).populate({ path: 'farmer_account_id', model: FarmerAccountModel }).lean();

    const dateRange = `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}-${end.toLocaleDateString('en-US', { day: 'numeric'})}, ${end.toLocaleDateString('en-US', { year: 'numeric' })}`;
    worksheet.getRow(7).getCell(2).value = dateRange;

    //pang sort alpabetically by farmer name
    records.sort((a, b) => {
      // // Handle cases where farmer_account_id might be null
      // if (!a.farmer_account_id) return 1;  // null values go to the end
      // if (!b.farmer_account_id) return -1; // null values go to the end
      
      // Get full names for comparison
      const nameA = `${a.farmer_account_id.first_name || ''} ${a.commodity || ''}`.toLowerCase();
      const nameB = `${b.farmer_account_id.first_name || ''} ${b.commodity || ''}`.toLowerCase();
      
      // Compare alphabetically
      return nameA.localeCompare(nameB);
    });

    const templateRow = worksheet.getRow(11);

    let currentRowIndex = 11;

    // Loop through records and insert new rows by cloning the template row design
    for (const record of records) {
      // Insert a new row at the current index
     
      const newRow = worksheet.getRow(currentRowIndex);

      templateRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        newRow.getCell(colNumber).style = { ...cell.style };
      });
      
      newRow.getCell('B').value = record.farmer_account_id 
        ? `${record.farmer_account_id.first_name}, ${record.farmer_account_id?.middle_name || ''}, ${record.farmer_account_id?.surname} ${record.farmer_account_id?.suffix || ''}` 
        : 'Unknown Farmer';

      newRow.getCell('A').value = record.farm_location || '';
      newRow.getCell('D').value = record.commodity || '';
      newRow.getCell('U').value = record.crop_stage || '';
      
      newRow.getCell('H').value = record.crop_stage === 'NEWLY PLANTED' && record.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS'
        ?  record.total_area_planted
        : record.crop_stage === 'NEWLY PLANTED' && record.crop_type === 'OTHER FRUIT CROPS/TREES' || 'BANANA' || 'COFFEE'
        ?  record.total_area_trees_planted : '';
      newRow.getCell('H').numFmt = '0.0000';


      newRow.getCell('I').value = record.crop_stage === 'HARVESTING' && record.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS'
        ?  record.total_area_harvested
        : record.crop_stage === 'HARVESTING' && record.crop_type === 'OTHER FRUIT CROPS/TREES' || 'BANANA' || 'COFFEE'
        ?  record.total_area_trees_harvested : '';
      newRow.getCell('I').numFmt = '0.0000';


      
      newRow.getCell('L').value = record.crop_stage === 'HARVESTING' ? record.total_weight / 1000 : '';
      newRow.getCell('L').numFmt = '0.0000';

      newRow.getCell('Q').value = record.crop_stage === 'HARVESTING' ? record.destination : '';
      newRow.getCell('S').value = record.crop_stage === 'HARVESTING' ? record.mode_of_payment : '' ;
      newRow.getCell('T').value = record.crop_stage === 'HARVESTING' ? record.mode_of_delivery : '' ;
      
      // Commit the row
      newRow.commit();
      
      // Increment row index so the next row is inserted below
      currentRowIndex++;
    }

    
    // Create the workbook buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Set headers for file download using res.attachment to avoid duplicate Content-Disposition
    const filename = `HVC_Report_${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}_to_${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.xlsx`;
    res.attachment(filename);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Length', buffer.length);
    
    // Send the response buffer
    res.send(buffer);
  } catch (error) {
    console.error('Error generating HVC Supply and Market Profile Report:', error);
    res.status(500).json({ 
      message: 'Error generating report', 
      error: error.message 
    });
  }
};


//PRODUCTION REPORT

 
//helper function to exactly copy block designs wihtouh value
const copyBlockFormatOnly = (sheet, sourceRange, targetStartCell) => {
  // --- Parse source range ---
  const [startCell, endCell] = sourceRange.split(':');
  const start = sheet.getCell(startCell);
  const end = sheet.getCell(endCell);

  const startRow = start.row;
  const startCol = start.col;
  const endRow = end.row;
  const endCol = end.col;

  // Target start coordinates, e.g. "G1"
  const targetStart = sheet.getCell(targetStartCell);
  const targetRowStart = targetStart.row;
  const targetColStart = targetStart.col;

  const rowOffset = targetRowStart - startRow;
  const colOffset = targetColStart - startCol;

  // --- Copy cell styles ---
  for (let r = 0; r <= endRow - startRow; r++) {
    const sourceRow = sheet.getRow(startRow + r);
    const targetRow = sheet.getRow(targetRowStart + r);

    if (sourceRow.height) targetRow.height = sourceRow.height;

    for (let c = 0; c <= endCol - startCol; c++) {
      const sourceCell = sourceRow.getCell(startCol + c);
      const targetCell = targetRow.getCell(targetColStart + c);

      targetCell.style = { ...sourceCell.style };
      targetCell.value = sourceCell.value;
    }
  }

  // --- Copy column widths ---
  for (let c = startCol; c <= endCol; c++) {
    const sourceCol = sheet.getColumn(c);
    const targetCol = sheet.getColumn(c + colOffset);
    if (sourceCol.width) targetCol.width = sourceCol.width;
  }

  // --- Copy merged cells (safe across exceljs versions) ---
  const getMergeRanges = (ws) => {
    if (Array.isArray(ws.model?.merges)) return ws.model.merges;            // preferred
    if (ws._merges instanceof Map) return Array.from(ws._merges.keys());    // older versions
    if (ws._merges && typeof ws._merges === 'object') return Object.keys(ws._merges);
    return [];
  };

  const mergeRanges = getMergeRanges(sheet);
  for (const range of mergeRanges) {
    const [mergeStart, mergeEnd] = range.split(':');
    const s = sheet.getCell(mergeStart);
    const e = sheet.getCell(mergeEnd);

    // Only copy merges fully inside the source block
    if (s.row >= startRow && e.row <= endRow && s.col >= startCol && e.col <= endCol) {
      const newStartRow = s.row + rowOffset;
      const newEndRow = e.row + rowOffset;
      const newStartCol = s.col + colOffset;
      const newEndCol = e.col + colOffset;

      sheet.mergeCells(newStartRow, newStartCol, newEndRow, newEndCol);
    }
  }
};

// Helper: apply borders to data rows (exclude header rows)
const applySectionBorders = (ws, sectionTopRow, headerRowsCount, commodityCount, fromColLetter = 'A', toColLetter = 'Y') => {
  const dataStartRow = sectionTopRow + headerRowsCount;
  const dataEndRow = dataStartRow + commodityCount - 1;
  const fromCol = ws.getCell(`${fromColLetter}1`).col;
  const toCol = ws.getCell(`${toColLetter}1`).col;

  const thin = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };

  for (let r = dataStartRow; r <= dataEndRow; r++) {
    const row = ws.getRow(r);
    for (let c = fromCol; c <= toCol; c++) {
      row.getCell(c).border = thin;
    }
  }
};

//then gagawa ng controller that will handle the acutal report genereation, accepting the selected year, month, and barangay..
export const generateHVCPR = async (req, res) => {
  const { year, month, barangays } = req.body;

  if (!year || !month || !Array.isArray(barangays) || barangays.length === 0) {
    return res.status(400).json({ message: 'Year, month, and barangay are required' });
  }

  try {
    const brgys = [...new Set(barangays.map(b => String(b).trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

    const yNum = Number(year);
    const mNum = Number(month);

    const startOfMonth = new Date(yNum, mNum - 1, 1, 0, 0, 0, 0);
    const midMonthEnd = new Date(yNum, mNum - 1, 15, 23, 59, 59, 999);
    const secondHalfStart = new Date(yNum, mNum - 1, 16, 0, 0, 0, 0);
    const endOfMonth = new Date(yNum, mNum, 0, 23, 59, 59, 999);

    const monthName = new Date(yNum, mNum - 1, 1).toLocaleString('default', { month: 'long' });
    const firstRange = `${monthName} ${startOfMonth.getDate()}-${midMonthEnd.getDate()}, ${yNum}`;
    const secondRange = `${monthName} ${secondHalfStart.getDate()}-${endOfMonth.getDate()}, ${yNum}`;

    const templatePath = path.resolve(__dirname, '../../templates/HVC Production Report Template.xlsx');
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ message: 'Template file not found' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.getWorksheet(1);

    // Set global month header once
    worksheet.getCell('A2').value = `for the month of ${monthName}`;

    const UnifiedFarmerRecordModel = global.getUnifiedFarmerRecordModel(yNum);

    // Section layout based on the template:
    const TEMPLATE_HEADER_TOP = 3; // header source starts at row 3 (A3:Y6)
    const HEADER_ROWS = 4; // rows 3..6
    const COMMODITY_COUNT = productionReportCommodities.length;
    const SECTION_ROWS = HEADER_ROWS + COMMODITY_COUNT; // total rows in one section
    const SPACER_ROWS = 1; // blank row between sections
    const SECTION_SOURCE_RANGE = `A${TEMPLATE_HEADER_TOP}:Y${TEMPLATE_HEADER_TOP + SECTION_ROWS - 1}`;

    const projection =
      'farmer_account_id crop_stage crop_type commodity ' +
      'total_area_planted total_area_trees_planted total_area_harvested total_area_trees_harvested total_weight';

    const initBucket = () => ({
      areaPlanted: 0,
      areaHarvested: 0,
      volOfProduction: 0,
      farmerIds: new Set(),
    });

    const aggregateByCommodity = (records) => {
      const result = {};
      productionReportCommodities.forEach((c) => {
        result[c] = initBucket();
      });

      for (const r of records) {
        const rawCommodity = (r.commodity || '').toString().trim().toUpperCase();
        if (!result[rawCommodity]) continue;

        if (r.crop_stage === 'NEWLY PLANTED') {
          const planted = Number(r.total_area_planted ?? 0);
          const treesPlanted = Number(r.total_area_trees_planted ?? 0);
          result[rawCommodity].areaPlanted += planted > 0 ? planted : treesPlanted;
          result[rawCommodity].farmerIds.add(String(r.farmer_account_id)); //pang area planted or newly planted lang daw kukunin number of farmers

        } else if (r.crop_stage === 'HARVESTING') {
          const harvested = Number(r.total_area_harvested ?? 0);
          const treesHarv = Number(r.total_area_trees_harvested ?? 0);
          const totalWeight = Number(r.total_weight ?? 0);
          result[rawCommodity].areaHarvested += harvested > 0 ? harvested : treesHarv;
          result[rawCommodity].volOfProduction += totalWeight;
        }
      }

      const out = {};
      const normalizeCell = (num) => {
        const value = (num || 0);
        return value === 0 ? null : Number(value.toFixed(2));
      };

      for (const [k, v] of Object.entries(result)) {
        const volTons = (v.volOfProduction || 0) / 1000; // adjust divisor to your unit
        const volTonsVal = Number(volTons.toFixed(2));

        out[k] = {
          areaPlanted: normalizeCell(v.areaPlanted),
          areaHarvested: normalizeCell(v.areaHarvested),
          volOfProduction: volTonsVal === 0 ? null : volTonsVal,
          farmers: v.farmerIds.size > 0 ? v.farmerIds.size : null,
        };
      }
      return out;
    };

    // Column mapping
    const COLS = {
      range1: { farmers: 'G', areaPlanted: 'F', areaHarvested: 'H', volOfProduction: 'I' }, // 1–15
      range2: { farmers: 'O', areaPlanted: 'N', areaHarvested: 'P', volOfProduction: 'Q' }, // 16–end
      totals: { aP: 'V', nF: 'W', aH: 'X', vP: 'Y' },
    };

    // Helper: write totals as true blanks if both halves are empty
    const writeTotal = (ws, rowIndex, outCol, leftVal, rightVal, numFmt) => {
      const cell = ws.getCell(`${outCol}${rowIndex}`);
      const isEmpty = (v) => v === null || v === undefined || v === '';
      if (isEmpty(leftVal) && isEmpty(rightVal)) {
        cell.value = null;
      } else {
        const sum = Number(leftVal || 0) + Number(rightVal || 0);
        cell.value = numFmt ? Number(sum.toFixed(2)) : sum;
        if (numFmt) cell.numFmt = numFmt;
      }
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    };

    let sectionIndex = 0;
    for (const barangay of brgys) {
      // Compute section top row and copy the section format (header + rows) after the first
      const sectionTopRow = TEMPLATE_HEADER_TOP + sectionIndex * (SECTION_ROWS + SPACER_ROWS);
      if (sectionIndex > 0) {
        copyBlockFormatOnly(worksheet, SECTION_SOURCE_RANGE, `A${sectionTopRow}`);
      }

      // Header cells for this section (relative to sectionTopRow)
      worksheet.getCell(`A${sectionTopRow}`).value = `${barangay}`;
      worksheet.getCell(`F${sectionTopRow + 1}`).value = `${firstRange}`;
      worksheet.getCell(`N${sectionTopRow + 1}`).value = `${secondRange}`;

      // Build date-overlap filter for this barangay only
      const buildFilterForRange = (rangeStart, rangeEnd) => ({
        farm_location: barangay,
        $or: [
          {
            crop_stage: 'HARVESTING',
            total_weight: { $gt: 0 }, // remove if not required
            $or: [
              { harvest_start_date: { $gte: rangeStart, $lte: rangeEnd } },
              { harvest_end_date:   { $gte: rangeStart, $lte: rangeEnd } },
              { harvest_start_date: { $lt: rangeStart }, harvest_end_date: { $gt: rangeEnd } },
            ],
          },
          {
            crop_stage: 'NEWLY PLANTED',
            $or: [
              { plantation_start_date: { $gte: rangeStart, $lte: rangeEnd } },
              { plantation_end_date:   { $gte: rangeStart, $lte: rangeEnd } },
              { plantation_start_date: { $lt: rangeStart }, plantation_end_date: { $gt: rangeEnd } },
            ],
          },
        ],
      });

      // Fetch both half-month ranges for this barangay
      const [recordsH1, recordsH2] = await Promise.all([
        UnifiedFarmerRecordModel.find(buildFilterForRange(startOfMonth, midMonthEnd)).select(projection).lean(),
        UnifiedFarmerRecordModel.find(buildFilterForRange(secondHalfStart, endOfMonth)).select(projection).lean(),
      ]);

      const aggH1 = aggregateByCommodity(recordsH1);
      const aggH2 = aggregateByCommodity(recordsH2);

      // Start commodity list at row A7 of this section => sectionTopRow + 4
      const startRow = sectionTopRow + HEADER_ROWS;

      productionReportCommodities.forEach((commodity, idx) => {
        const rowIndex = startRow + idx;
        const h1 = aggH1[commodity] || { farmers: null, areaPlanted: null, areaHarvested: null, volOfProduction: null };
        const h2 = aggH2[commodity] || { farmers: null, areaPlanted: null, areaHarvested: null, volOfProduction: null };

        // Commodity name
        worksheet.getCell(`A${rowIndex}`).value = commodity;

        // First half (1–15)
        worksheet.getCell(`${COLS.range1.farmers}${rowIndex}`).value = h1.farmers ?? null;
        worksheet.getCell(`${COLS.range1.areaPlanted}${rowIndex}`).value = h1.areaPlanted ?? null;
        worksheet.getCell(`${COLS.range1.areaPlanted}${rowIndex}`).numFmt = '0.00';
        worksheet.getCell(`${COLS.range1.areaHarvested}${rowIndex}`).value = h1.areaHarvested ?? null;
        worksheet.getCell(`${COLS.range1.areaHarvested}${rowIndex}`).numFmt = '0.00';
        worksheet.getCell(`${COLS.range1.volOfProduction}${rowIndex}`).value = h1.volOfProduction ?? null;
        worksheet.getCell(`${COLS.range1.volOfProduction}${rowIndex}`).numFmt = '0.00';

        worksheet.getCell(`${COLS.range1.farmers}${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`${COLS.range1.areaPlanted}${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`${COLS.range1.areaHarvested}${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`${COLS.range1.volOfProduction}${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'center' };

        // Second half (16–end)
        worksheet.getCell(`${COLS.range2.farmers}${rowIndex}`).value = h2.farmers ?? null;
        worksheet.getCell(`${COLS.range2.areaPlanted}${rowIndex}`).value = h2.areaPlanted ?? null;
        worksheet.getCell(`${COLS.range2.areaPlanted}${rowIndex}`).numFmt = '0.00';
        worksheet.getCell(`${COLS.range2.areaHarvested}${rowIndex}`).value = h2.areaHarvested ?? null;
        worksheet.getCell(`${COLS.range2.areaHarvested}${rowIndex}`).numFmt = '0.00';
        worksheet.getCell(`${COLS.range2.volOfProduction}${rowIndex}`).value = h2.volOfProduction ?? null;
        worksheet.getCell(`${COLS.range2.volOfProduction}${rowIndex}`).numFmt = '0.00';

        worksheet.getCell(`${COLS.range2.farmers}${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`${COLS.range2.areaPlanted}${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`${COLS.range2.areaHarvested}${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell(`${COLS.range2.volOfProduction}${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'center' };

        // Totals (true blank if both halves empty)
        writeTotal(worksheet, rowIndex, COLS.totals.aP, h1.areaPlanted, h2.areaPlanted, '0.00');
        writeTotal(worksheet, rowIndex, COLS.totals.nF, h1.farmers, h2.farmers, null);
        writeTotal(worksheet, rowIndex, COLS.totals.aH, h1.areaHarvested, h2.areaHarvested, '0.00');
        writeTotal(worksheet, rowIndex, COLS.totals.vP, h1.volOfProduction, h2.volOfProduction, '0.00');
      });

      applySectionBorders(worksheet, sectionTopRow, HEADER_ROWS, COMMODITY_COUNT, 'A', 'Y');
      sectionIndex++;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const monthLabel = new Date(yNum, mNum - 1, 1).toLocaleString('en-US', { month: 'short' });
    const filename = `HVC_Production_Report_${monthLabel}_${yNum}.xlsx`;

    res.attachment(filename);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('Error generating HVC Production Report:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};