import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getUnifiedFarmerRecordModel } from '../models/unifiedFarmerResponse.model.js';

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
    const UnifiedFarmerRecordModel = getUnifiedFarmerRecordModel(yearNum);
    
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

// Generate Excel report based on date range
export const generateExcelReport = async (req, res) => {
  const { startDate, endDate, reportType } = req.body;
  
  if (!startDate || !endDate) {
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
    const templatePath = path.resolve(__dirname, '../templates/Supply and Market Profile Report Template.xlsx');
    console.log('Template path:', templatePath);
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ message: 'Template file not found' });
    }
    
    // Load the workbook from the template
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    
    // Assume the first worksheet is the target
    const worksheet = workbook.getWorksheet(1);
  
    // Update date range in the template
    const dateRangeCell = worksheet.getCell('B7');
    if (dateRangeCell.value) {
      dateRangeCell.value = `${start.toLocaleDateString('en-US')} to ${end.toLocaleDateString('en-US')}`;
    }

    // Query data from the database based on the date range
    const UnifiedFarmerRecordModel = getUnifiedFarmerRecordModel(year);
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

    // Validate retrieved data
    console.log(`Found ${records.length} records for the selected date range`);
    
    if (records.length === 0) {
      console.log('No records found for the selected date range');
    }
    
    // Clone signatory block (rows after data rows)
    const signatoryStartRow = 24; // Adjust based on your template
    const signatoryEndRow = 40;   // Adjust based on your template
    const signatoryBlock = [];
    
    for (let i = signatoryStartRow; i <= signatoryEndRow; i++) {
      const row = worksheet.getRow(i);
      // Clone the row's values and styles
      const rowClone = {
        values: [...row.values],
        cells: []
      };
      
      // Clone cell styles too
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        rowClone.cells[colNumber] = {
          style: { ...cell.style },
          value: cell.value
        };
      });
      
      signatoryBlock.push(rowClone);
    }
    
    // Remove original signatory rows so they don't duplicate
    worksheet.spliceRows(signatoryStartRow, signatoryEndRow - signatoryStartRow + 1);

    // Get template row
    const templateRow = worksheet.getRow(11);
    
    // Starting row index for data
    let currentRowIndex = 11;
    
    // Error tracking
    let successCount = 0;
    let errorCount = 0;
    const errorRecords = [];

    // Loop through records and insert data
    for (const [index, record] of records.entries()) {
      try {
        // Get or create the row
        const newRow = worksheet.getRow(currentRowIndex);
        
        // Copy template styling
        templateRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          try {
            newRow.getCell(colNumber).style = { ...cell.style };
          } catch (cellError) {
            console.error(`Error copying cell style at column ${colNumber}:`, cellError);
          }
        });
        
        // Validate record before attempting to use it
        if (!record) {
          console.error(`Record at index ${index} is null or undefined`);
          errorCount++;
          errorRecords.push({ index, error: 'Record is null or undefined' });
          continue;
        }
        
        // Safe property access with optional chaining and validation
        try {
          // Farmer name with validation
          const firstName = record.farmer_account_id?.first_name || '';
          const middleName = record.farmer_account_id?.middle_name || '';
          const surname = record.farmer_account_id?.surname || '';
          const suffix = record.farmer_account_id?.suffix || '';
          
          const fullName = record.farmer_account_id 
            ? `${firstName} ${middleName ? middleName + '. ' : ''}${surname} ${suffix ? suffix + '.' : ''}`
            : 'Unknown Farmer';
            
          newRow.getCell('B').value = fullName;
          
          // Other fields with validation
          newRow.getCell('A').value = record.farm_location || '';
          newRow.getCell('D').value = record.commodity || '';
          newRow.getCell('U').value = record.crop_stage || '';
          
          // Ensure crop_stage and cropType exist before using in conditions
          const cropStage = record.crop_stage || '';
          const cropType = record.cropType || '';
          
          // Area calculations with validation
          if (cropStage === 'NEWLY PLANTED') {
            if (cropType === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
              newRow.getCell('H').value = record.total_area_planted || 0;
            } else {
              newRow.getCell('H').value = record.total_area_trees_planted || 0;
            }
          } else {
            newRow.getCell('H').value = ''; // Not newly planted
          }
          
          if (cropStage === 'HARVESTING') {
            if (cropType !== 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
              newRow.getCell('I').value = record.total_area_harvested || 0;
            } else {
              newRow.getCell('I').value = ''; // Not applicable
            }
          } else if (cropStage === 'NEWLY PLANTED' && cropType !== 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
            newRow.getCell('I').value = record.total_area_trees_harvested || 0;
          } else {
            newRow.getCell('I').value = ''; // Not applicable
          }
          
          // Weight calculation with validation
          if (cropStage === 'HARVESTING') {
            const weight = record.total_weight || 0;
            newRow.getCell('L').value = weight / 10000; // Convert to appropriate unit
          } else {
            newRow.getCell('L').value = '';
          }
          
          // Other harvesting-related fields
          newRow.getCell('Q').value = cropStage === 'HARVESTING' ? (record.destination || '') : '';
          newRow.getCell('S').value = cropStage === 'HARVESTING' ? (record.mode_of_payment || '') : '';
          newRow.getCell('T').value = cropStage === 'HARVESTING' ? (record.mode_of_delivery || '') : '';
          
          // Commit the row
          newRow.commit();
          
          // Increment row index for next record
          currentRowIndex++;
          successCount++;
          
        } catch (recordError) {
          console.error(`Error processing record at index ${index}:`, recordError, record);
          errorCount++;
          errorRecords.push({ index, error: recordError.message, record: JSON.stringify(record) });
        }
      } catch (rowError) {
        console.error(`Error processing row at index ${index}:`, rowError);
        errorCount++;
        errorRecords.push({ index, error: rowError.message });
      }
    }
    
    // Log processing summary
    console.log(`Data processing complete. Success: ${successCount}, Errors: ${errorCount}`);
    if (errorCount > 0) {
      console.error('Error records:', errorRecords);
    }
    
    // Optionally add two blank rows
    worksheet.spliceRows(currentRowIndex, 0, [], []);
    currentRowIndex += 2;
    
    // Insert signatory block back at the bottom
    signatoryBlock.forEach((rowData, idx) => {
      const newRow = worksheet.getRow(currentRowIndex + idx);
      
      // Restore values
      newRow.values = [...rowData.values];
      
      // Restore styles
      rowData.cells.forEach((cellData, colNumber) => {
        if (cellData && cellData.style) {
          newRow.getCell(colNumber).style = { ...cellData.style };
        }
        if (cellData && cellData.value !== undefined) {
          newRow.getCell(colNumber).value = cellData.value;
        }
      });
      
      newRow.commit();
    });
    
    // Create the workbook buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Set headers for file download
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
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};