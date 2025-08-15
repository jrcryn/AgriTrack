import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
    }).populate('farmer_account_id').lean();

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


      
      newRow.getCell('L').value = record.crop_stage === 'HARVESTING' ? record.total_weight / 10000 : '';
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
    console.error('Error generating Excel report:', error);
    res.status(500).json({ 
      message: 'Error generating report', 
      error: error.message 
    });
  }
};


//then gagawa ng controller that will handle the acutal report genereation, accepting the selected barangay/s

