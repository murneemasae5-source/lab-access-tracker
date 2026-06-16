/**
 * ระบบบันทึกการเข้าใช้งานห้องปฏิบัติการนอกเวลาราชการ (Google Apps Script API)
 * ใช้สำหรับเป็นตัวกลางรับ-ส่งข้อมูลระหว่างหน้าเว็บ (HTML) และ Google Sheets
 */

// 1. ฟังก์ชันสำหรับรับข้อมูลจากหน้าเว็บมาบันทึกลง Google Sheets (POST Request)
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // ทำการบันทึกข้อมูลลงแถวใหม่ต่อท้ายตารางเรียงตามคอลัมน์:
    // A: id, B: name, C: entryDateTime, D: exitDateTime, E: activity
    sheet.appendRow([
      data.id,
      data.name,
      data.entryDateTime,
      data.exitDateTime,
      data.activity
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "บันทึกข้อมูลเรียบร้อยแล้ว" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. ฟังก์ชันสำหรับดึงข้อมูลจาก Google Sheets ส่งไปแสดงผลที่หน้าเว็บ หรือลบข้อมูล (GET Request)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var action = e.parameter.action;
    
    // กรณีที่ 1: สั่งให้ลบข้อมูล (Delete)
    if (action === "delete") {
      var idToDelete = e.parameter.id;
      var rows = sheet.getDataRange().getValues();
      var found = false;
      
      // ค้นหา ID ที่ตรงกันในคอลัมน์แรก (คอลัมน์ A) เพื่อลบแถวนั้น
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0].toString() === idToDelete.toString()) {
          sheet.deleteRow(i + 1); // แถวใน Sheet เริ่มที่ 1 และแถวแรกเป็น Header จึงต้อง + 1
          found = true;
          break;
        }
      }
      
      if (found) {
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "ลบข้อมูลสำเร็จ" }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "ไม่พบข้อมูลที่ต้องการลบ" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // กรณีที่ 2: ดึงข้อมูลทั้งหมดไปแสดงบนหน้าเว็บ (Read - Default Action)
    var rows = sheet.getDataRange().getValues();
    var result = [];
    
    // เริ่มวนลูปตั้งแต่แถวที่ 2 (ดัชนีที่ 1) ข้ามแถวหัวข้อ (Header)
    for (var i = 1; i < rows.length; i++) {
      result.push({
        id: rows[i][0],
        name: rows[i][1],
        entryDateTime: rows[i][2],
        exitDateTime: rows[i][3],
        activity: rows[i][4]
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      data: result 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}