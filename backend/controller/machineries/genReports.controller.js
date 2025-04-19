import ExcelJS from 'exceljs';
import Barangays from "../../../frontend/src/components/barangays.js";


const createColumnKey = (header) => {
    return header.toLowerCase().replace(/[\s.]+/g, '_');
  };

  
export const generateMachineryExcelReport = async (req, res) => {
    try {
        // Get all machinery units
        const machineryUnits = await global.machineriesModels.MachineriesUnit.find().lean();
        
        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Machinery Inventory');
        
        // Set up headers with their exact keys
        const headerConfig = [
            { header: 'Unit Name', key: 'unit_name' },
            { header: 'No. of Units', key: 'no_of_units' },
            { header: 'Functional', key: 'functional' },
            { header: 'Non-Functional', key: 'non_functional' },
            { header: 'Remarks', key: 'remarks' }
        ];
        
        // Create barangay header configs
        const barangayHeaderConfig = Barangays.map(barangay => ({
            header: barangay,
            key: createColumnKey(barangay)
        }));
        
        // Combine all header configs
        const allHeaderConfig = [...headerConfig, ...barangayHeaderConfig];
        const columnCount = allHeaderConfig.length;
        
        // Apply column definitions with consistent keys
        worksheet.columns = allHeaderConfig.map(config => ({
            ...config,
            width: 12
        }));
        
        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;
        headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colNumber <= columnCount) {
                // Add borders to all header cells
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                
                // Color the headers: first 5 columns green, rest orange
                if (colNumber <= 5) {
                    // Unit Name, No. of Units, Functional, Non-Functional, Remarks
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF228B22' } // Green
                    };
                } else {
                    // Barangay headers
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFCD5B4' } // Light orange/peach
                    };
                }
            }
        });
        
        // Add data rows for each machinery unit
        machineryUnits.forEach((unit, rowIndex) => {
            // Calculate totals
            const totalFunctional = unit.barangay_allocations.reduce(
                (sum, alloc) => sum + (alloc.functional_units || 0), 0
            );
            const totalNonFunctional = unit.barangay_allocations.reduce(
                (sum, alloc) => sum + (alloc.non_functional_units || 0), 0
            );
            const totalUnits = totalFunctional + totalNonFunctional;
            
            // Create row with main data - use exact keys from headerConfig
            const rowValues = {
                unit_name: unit.unit_name,
                no_of_units: totalUnits,
                functional: totalFunctional,
                non_functional: totalNonFunctional,
                remarks: unit.remarks || ''
            };
            
            // Add empty values for barangay columns first
            Barangays.forEach((barangay) => {
                const colKey = createColumnKey(barangay);
                rowValues[colKey] = '';
            });
            
            // Add the row with basic values
            const dataRow = worksheet.addRow(rowValues);
            
            // Apply borders and center alignment to all cells
            dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (colNumber <= columnCount) {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                }
        
                if (colNumber > 1) {
                    cell.alignment = { horizontal: 'center' };
                }
            });
            
            // Now update barangay cells with colored rich text
            Barangays.forEach((barangay, index) => {
                const allocation = unit.barangay_allocations.find(
                    alloc => alloc.barangay === barangay
                );
                
                if (allocation) {
                    const functional = allocation.functional_units || 0;
                    const nonFunctional = allocation.non_functional_units || 0;
                    
                    if (functional > 0 || nonFunctional > 0) {
                        // Get the cell from the current row for this barangay
                        const colIndex = headerConfig.length + index + 1; // +1 because Excel is 1-based
                        const cell = dataRow.getCell(colIndex);
                        
                        // Apply rich text with different colors
                        cell.value = {
                            richText: [
                                {
                                    text: functional.toString(),
                                    font: { color: { argb: 'FF00B050' } } // Green for functional
                                },
                                {
                                    text: '/',
                                    font: { color: { argb: 'FF000000' } } // Black for separator
                                },
                                {
                                    text: nonFunctional.toString(),
                                    font: { color: { argb: 'FFFF0000' } } // Red for non-functional
                                }
                            ]
                        };
                    }
                }
            });
        });
        
        // Auto-size columns based on content
        worksheet.columns.forEach((column, index) => {
            if (index < columnCount) {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const columnLength = cell.value ? cell.value.toString().length : 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = Math.max(10, Math.min(maxLength + 2, 30));
            }
        });
        
        // Set file name with current date
        const date = new Date().toISOString().split('T')[0];
        const filename = `Machinery_Inventory_${date}.xlsx`;
        
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        
        // Write to response and end
        await workbook.xlsx.write(res);
        res.end();
        
    } catch (error) {
        console.error('Error generating machinery Excel report:', error);
        res.status(500).json({
            message: 'Error generating machinery Excel report',
            error: error.message
        });
    }
};