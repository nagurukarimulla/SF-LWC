@RestResource(urlMapping='/CaseManagement/v1/*')
global with sharing class CaseMgmtService
{
    @HttpPost
    global static String attachPic() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        
        try {
            // Extract Case ID from URL
            Id caseId = req.requestURI.substring(req.requestURI.lastIndexOf('/')+1);
            
            // Validate Case exists
            Case existingCase = [SELECT Id FROM Case WHERE Id = :caseId LIMIT 1];
            
            // Get the file data
            Blob picture = req.requestBody;
            
            // Get content type from header (default to image/jpeg)
            String contentType = req.headers.get('Content-Type');
            if (String.isBlank(contentType)) {
                contentType = 'image/jpeg';
            }
            
            // Determine file extension from content type
            String fileExtension = getFileExtension(contentType);
            
            // Generate proper filename
            String fileName = 'Attachment_' + DateTime.now().format('yyyyMMdd_HHmmss') + fileExtension;
            
            // Validate file size (max 10MB)
            if (picture.size() > 10000000) {
                res.statusCode = 400;
                return 'Error: File size exceeds 10MB limit. Current size: ' + picture.size() + ' bytes';
            }
            
            // Validate file size minimum
            if (picture.size() == 0) {
                res.statusCode = 400;
                return 'Error: File is empty. Please upload a valid file.';
            }
            
            // Create attachment with proper metadata
            Attachment a = new Attachment();
            a.ParentId = caseId;
            a.Body = picture;
            a.ContentType = contentType;
            a.Name = fileName;
            
            insert a;
            
            // Return success response with attachment ID
            res.statusCode = 201;
            return JSON.serialize(new Map<String, String>{
                'attachmentId' => a.Id,
                'fileName' => fileName,
                'fileSize' => String.valueOf(picture.size()),
                'contentType' => contentType,
                'status' => 'success'
            });
            
        } catch (Exception e) {
            res.statusCode = 400;
            return JSON.serialize(new Map<String, String>{
                'status' => 'error',
                'message' => e.getMessage(),
                'errorType' => e.getTypeName()
            });
        }
    }
    
    // Helper method to get file extension from content type
    private static String getFileExtension(String contentType) {
        Map<String, String> extensionMap = new Map<String, String>{
            'image/jpeg' => '.jpg',
            'image/jpg' => '.jpg',
            'image/png' => '.png',
            'image/gif' => '.gif',
            'image/bmp' => '.bmp',
            'image/webp' => '.webp',
            'application/pdf' => '.pdf',
            'text/plain' => '.txt',
            'application/msword' => '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => '.docx',
            'application/vnd.ms-excel' => '.xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => '.xlsx',
            'application/zip' => '.zip'
        };
        
        if (extensionMap.containsKey(contentType.toLowerCase())) {
            return extensionMap.get(contentType.toLowerCase());
        }
        
        // Default extension if unknown
        return '';
    }
}