public with sharing class HolidayAPIController {

    private static final String API_KEY = 'af74197d-84c8-41b6-9590-a63508d2a016';
    private static final String BASE_URL = 'https://holidayapi.com/v1/holidays';

    @AuraEnabled(cacheable=true)
    public static String getHolidays(String countryCode, String yearValue) {

        Http http = new Http();
        HttpRequest req = new HttpRequest();

        String endpoint =
            BASE_URL +
            '?country=' + EncodingUtil.urlEncode(countryCode,'UTF-8') +
            '&year=' + EncodingUtil.urlEncode(yearValue,'UTF-8') +
            '&pretty=true' +
            '&key=' + API_KEY;

        req.setEndpoint(endpoint);
        req.setMethod('GET');
        req.setTimeout(60000);

        HttpResponse res = http.send(req);

        if(res.getStatusCode() == 200){
            return res.getBody();
        }

        throw new AuraHandledException(
            'Holiday API Error : ' + res.getBody()
        );
    }
}