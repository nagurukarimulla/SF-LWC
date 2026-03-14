public with sharing class CaseService {
    private CaseSelector caseSelector;

    // Constructor with selector parameter
    public CaseService(CaseSelector selector) {
        this.caseSelector = selector;
    }

    // Default constructor
    public CaseService() {
        this(new CaseSelector());
    }

    // This method needs to match the signature being called
    public List<Case> getCasesWithRelations(Set<Id> caseIds) {
        // Check if caseIds is null or empty
        if (caseIds == null || caseIds.isEmpty()) {
            // Return all cases if no IDs provided
            return caseSelector.selectAllCasesWithRelations();
        }
        return caseSelector.selectCasesWithRelations(caseIds);
    }
    
    // Add this method for getting all cases
    public List<Case> getAllCasesWithRelations() {
        return caseSelector.selectAllCasesWithRelations();
    }
}