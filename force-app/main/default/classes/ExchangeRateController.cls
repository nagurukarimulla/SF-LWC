public with sharing class ExchangeRateController {
    
    private static final String API_KEY = '6c6d5f7f331be65afc0cf7c4';
    private static final String BASE_URL = 'https://v6.exchangerate-api.com/v6';
    
    public class ExchangeRateResponse {
        @AuraEnabled public String result { get; set; }
        @AuraEnabled public String base_code { get; set; }
        @AuraEnabled public String time_last_update_utc { get; set; }
        @AuraEnabled public String time_next_update_utc { get; set; }
        @AuraEnabled public Map<String, Decimal> conversion_rates { get; set; }
        @AuraEnabled public String error_type { get; set; }
        @AuraEnabled public String error_message { get; set; }
    }
    
    @AuraEnabled(cacheable=false)
    public static ExchangeRateResponse getExchangeRates(String baseCurrency) {
        ExchangeRateResponse response = new ExchangeRateResponse();
        
        try {
            if (String.isBlank(baseCurrency)) {
                response.result = 'error';
                response.error_type = 'invalid-input';
                response.error_message = 'Base currency is required';
                return response;
            }
            
            String endpoint = BASE_URL + '/' + API_KEY + '/latest/' + baseCurrency.toUpperCase();
            
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endpoint);
            req.setMethod('GET');
            req.setTimeout(120000);
            
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            if (res.getStatusCode() == 200) {
                Map<String, Object> jsonResponse = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                
                if (jsonResponse.get('result') == 'success') {
                    response.result = 'success';
                    response.base_code = (String) jsonResponse.get('base_code');
                    response.time_last_update_utc = (String) jsonResponse.get('time_last_update_utc');
                    response.time_next_update_utc = (String) jsonResponse.get('time_next_update_utc');
                    
                    Map<String, Object> ratesMap = (Map<String, Object>) jsonResponse.get('conversion_rates');
                    response.conversion_rates = new Map<String, Decimal>();
                    
                    for (String currencyCode : ratesMap.keySet()) {
                        Object rateValue = ratesMap.get(currencyCode);
                        Decimal rate = Decimal.valueOf(String.valueOf(rateValue));
                        response.conversion_rates.put(currencyCode, rate);
                    }
                } else {
                    response.result = 'error';
                    response.error_type = (String) jsonResponse.get('error-type');
                    response.error_message = getErrorMessage(response.error_type);
                }
            } else {
                response.result = 'error';
                response.error_type = 'http-error';
                response.error_message = 'HTTP Error: ' + res.getStatusCode() + ' - ' + res.getStatus();
            }
            
        } catch (Exception e) {
            response.result = 'error';
            response.error_type = 'exception';
            response.error_message = 'Error: ' + e.getMessage();
        }
        
        return response;
    }
    
    private static String getErrorMessage(String errorType) {
        Map<String, String> errorMessages = new Map<String, String>{
            'unsupported-code' => 'The supplied currency code is not supported',
            'malformed-request' => 'The request structure is invalid',
            'invalid-key' => 'The API key is not valid',
            'inactive-account' => 'The account email address has not been confirmed',
            'quota-reached' => 'The account has reached the maximum number of requests'
        };
        
        return errorMessages.containsKey(errorType) ? errorMessages.get(errorType) : 'Unknown error occurred';
    }
}