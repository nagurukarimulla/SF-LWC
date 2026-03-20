public class Opportunities extends fflib_SObjectDomain {
    public Opportunities(List<Opportunity> sObjectList) { super(sObjectList); }

    public void validateForOnboarding() {
        for(Opportunity opp : (List<Opportunity>) Records) {
            if(opp.Amount == null || opp.Amount <= 0) {
                throw new DomainException('Cannot onboard: Opportunity Amount is missing or zero.');
            }
        }
    }
    public class DomainException extends Exception {}
}