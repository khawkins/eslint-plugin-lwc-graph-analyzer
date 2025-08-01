/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const { RuleTester } = require('eslint');
const { RULE_TESTER_CONFIG } = require('./shared');
const lwcGraphAnalyzer = require('../../../lib/index');
const ruleTester = new RuleTester(RULE_TESTER_CONFIG);

ruleTester.run(
    '@salesforce/lwc-graph-analyzer/no-reference-to-class-functions',
    lwcGraphAnalyzer.rules['no-reference-to-class-functions'],
    {
        valid: [],
        invalid: [
            {
                code: `import { LightningElement, wire, api } from 'lwc';
                import { getRecord } from 'lightning/uiRecordApi';
                import findContacts from '@salesforce/apex/ContactController.findContacts';
                import { testFunction } from 'test/functoins/testFunctoins';
                
                const testFunc1 = () => 'dog';
                
                export default class Example extends LightningElement {
                    @api
                    recordId;
                    get searchKey() {
                        const recordName = this.record?.data?.Fields?.name;
                        
                        let testVar = testFunction(); //invalid bc import from unsupported ns
                
                        if(recordName) {
                            return '%' + recordName + '%';
                        }
                
                        this.testFunc2(); //invalid bc function defined on class
                
                        return 'Default Search Key';
                    }
                    @wire(getRecord, { recordId: '$recordId', layoutTypes: ['Full'], modes: ['View'] })
                    record = {};
                
                    @wire(findContacts, { searchKey: '$searchKey' })
                    contacts;
                
                    testFunc2() {
                      return 'foo';
                    }
                }`,
                filename: 'lwc-code.js',
                errors: [
                    {
                        message: `This call expression references a function defined in the class 'testFunc2'. Functions defined in a class are not supported.`
                    }
                ]
            }
        ]
    }
);
