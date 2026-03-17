public with sharing class FileUploadController {
    
    @AuraEnabled
    public static List<FileHistoryWrapper> getFileHistory(String recordId, String userId) {
        try {
            String query = 'SELECT ContentDocumentId, ContentDocument.Title, ContentDocument.FileType, ' +
                          'ContentDocument.ContentSize, ContentDocument.CreatedDate, ContentDocument.CreatedBy.Name ' +
                          'FROM ContentDocumentLink ';
            
            if (String.isNotBlank(recordId)) {
                // Get files for a specific record
                query += 'WHERE LinkedEntityId = :recordId ';
            } else if (String.isNotBlank(userId)) {
                // Get personal files for a user
                query += 'WHERE LinkedEntityId = :userId AND LinkedEntity.Type = \'User\' ';
            } else {
                return new List<FileHistoryWrapper>();
            }
            
            query += 'ORDER BY ContentDocument.CreatedDate DESC LIMIT 50';
            
            List<ContentDocumentLink> links = Database.query(query);
            
            List<FileHistoryWrapper> history = new List<FileHistoryWrapper>();
            for (ContentDocumentLink link : links) {
                history.add(new FileHistoryWrapper(link));
            }
            
            return history;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving file history: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void deleteFile(String contentDocumentId) {
        try {
            ContentDocument doc = [SELECT Id FROM ContentDocument WHERE Id = :contentDocumentId];
            delete doc;
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting file: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static String getObjectName(String recordId) {
        try {
            Id recordIdObj = (Id) recordId;
            return recordIdObj.getSObjectType().getDescribe().getName();
        } catch (Exception e) {
            return 'Record';
        }
    }
    
    // Wrapper class
    public class FileHistoryWrapper {
        @AuraEnabled public String contentDocumentId;
        @AuraEnabled public String title;
        @AuraEnabled public String fileType;
        @AuraEnabled public Integer contentSize;
        @AuraEnabled public DateTime createdDate;
        @AuraEnabled public String uploadedBy;
        
        public FileHistoryWrapper(ContentDocumentLink link) {
            this.contentDocumentId = link.ContentDocumentId;
            this.title = link.ContentDocument.Title;
            this.fileType = link.ContentDocument.FileType;
            this.contentSize = (Integer)link.ContentDocument.ContentSize;
            this.createdDate = link.ContentDocument.CreatedDate;
            this.uploadedBy = link.ContentDocument.CreatedBy.Name;
        }
    }
}