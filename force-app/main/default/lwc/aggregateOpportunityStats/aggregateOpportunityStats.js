import { LightningElement, wire } from 'lwc';
import { gql, graphql } from 'lightning/graphql';

export default class AggregateOpportunityStats extends LightningElement {

    results;
    totalCount;
    errors;

    @wire(graphql, {
        query: gql`
            query OpportunityAggregateQuery {
                uiapi {
                    aggregate {
                        Opportunity {
                            edges {
                                node {
                                    aggregate {
                                        Amount {
                                            avg {
                                                displayValue
                                            }
                                            sum {
                                                displayValue
                                            }
                                        }
                                    }
                                }
                            }
                            totalCount
                        }
                    }
                }
            }
        `
    })

    graphqlQueryResult({ data, errors }) {

        if (data) {

            this.results =
                data.uiapi.aggregate.Opportunity.edges.map(
                    edge => edge.node
                );

            this.totalCount =
                data.uiapi.aggregate.Opportunity.totalCount;
        }

        this.errors = errors;
    }
}