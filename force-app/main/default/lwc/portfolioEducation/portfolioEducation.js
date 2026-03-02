import { LightningElement } from 'lwc';
import logos from '@salesforce/resourceUrl/eduLogos';


export default class PortfolioEducation extends LightningElement {

    educationList = [
        {
            degree: 'M.Tech – Computer Science & Engineering',
            institution: 'Vemu Institute of Technology, Chittoor',
            location: 'Andhra Pradesh',
            year: '2021',
            icon: logos + '/mtech.png'
        },
        {
            degree: 'M.Sc – Computer Science',
            institution: 'Sri Venkateswara University, Tirupati',
            location: 'Andhra Pradesh',
            year: '2017',
            icon: logos + '/msc.png'
        },
        {
            degree: 'B.Sc – Computer Science',
            institution: 'Sri Vaishnavi Degree & PG College, Rajampet',
            location: 'Andhra Pradesh',
            year: '2015',
            icon: logos + '/bsc.png'
        },
        {
            degree: 'Intermediate',
            institution: 'Sri Shiridi Sai Junior College, Rajampet',
            location: 'Andhra Pradesh',
            year: '2012',
            icon: logos + '/inter.png'
        },
        {
            degree: 'SSC',
            institution: 'Sri Chakra High School, Rajampet',
            location: 'Andhra Pradesh',
            year: '2010',
            icon: logos + '/ssc.png'
        }
    ];
}