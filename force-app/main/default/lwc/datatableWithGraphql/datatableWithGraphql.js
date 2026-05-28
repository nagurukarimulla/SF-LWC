import { LightningElement, wire } from 'lwc';
import { gql, graphql } from 'lightning/graphql';

const columns = [
    {
        label: 'Account Name',
        fieldName: 'Name',
        type: 'text'
    },
    {
        label: 'Phone',
        fieldName: 'Phone',
        type: 'phone'
    },
    {
        label: 'Website',
        fieldName: 'Website',
        type: 'url',
        typeAttributes: {
            label: { fieldName: 'Website' },
            target: '_blank'
        }
    },
    {
        label: 'Annual Revenue',
        fieldName: 'AnnualRevenue',
        type: 'currency'
    }
];

export default class DatatableWithGraphql extends LightningElement {

    accounts = [];
    errors;
    columns = columns;

    @wire(graphql, {
        query: gql`
            query AccountDataTable {
                uiapi {
                    query {
                        Account(
                            first: 10
                        ) {
                            edges {
                                node {
                                    Id
                                    Name {
                                        value
                                    }
                                    Phone {
                                        value
                                    }
                                    Website {
                                        value
                                    }
                                    AnnualRevenue {
                                        value
                                        displayValue
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `
    })
    graphqlHandler({ data, errors }) {

        if (data) {

            this.accounts =
                data.uiapi.query.Account.edges.map(edge => ({
                    Id: edge.node.Id,
                    Name: edge.node.Name?.value,
                    Phone: edge.node.Phone?.value,
                    Website: edge.node.Website?.value,
                    AnnualRevenue: edge.node.AnnualRevenue?.value
                }));

            this.errors = undefined;
        }

        if (errors) {
            this.errors = errors;
            this.accounts = [];
            console.error('GraphQL Errors:', errors);
        }
    }
}