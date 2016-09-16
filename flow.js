'use strict';

/**
* A simple flow engine
*/
class Flow {

    /**
     * Expects an array of rules on which the object runs against.
     * Removes duplicates and reformats it to an assoc array.
     *
     * @param rules Array with rule objects
     */
    constructor(rules){
        this.rules = {};
        this.executedRules = {};
        rules.forEach((el) => {
            this.rules[el.id] = el;
            //This could be done also with eval() but I don't want to use eval due to performance & security risks
            this.rules[el.id].method = new Function('obj', this.rules[el.id].method);
        });
    }

    /**
     * Executes rule by rule recursively until the result will be null.
     * Pretends circular execution while checking if a rule was executed before.
     *
     * @param id Rule Id
     * @param obj Object to check
     * @returns {*} returns it self or an object with the executed rules
     */
    executeRule(id, obj){
        const executedBefore = (this.executedRules[id] !== undefined); //If this is true, the rules are circular
        if(executedBefore){return this.executedRules;} //stops execution immediately
        const passed = this.executedRules[id] = this.rules[id].method(obj);
        const nextId = (passed) ? this.rules[id].trueId : this.rules[id].falseId;
        this.log(id, passed, nextId, executedBefore); //only for console output
        return (nextId !== null && !executedBefore) ? this.executeRule(nextId, obj) : this.executedRules;
    }

    /**
     * helper method for console log
     */
    log(id, passed, nextId, executedBefore){
        console.log(((passed) ? '\x1b[42m' : '\x1b[41m'), this.rules[id].title, ((passed) ? 'passed' : 'failed') + ' next will be id:', nextId + '\x1b[40m');
        if(executedBefore){console.log('\x1b[44m' + 'circular!' + '\x1b[40m')}
    }

    /**
     * Initialize the flow enginge with the first rule (id=1).
     * Returns the result auf the flow as an object.
     *
     * @param obj Object to check
     * @returns {*}
     */
    init(obj){
        return this.executeRule(1, obj);
    }

}

/**
 * Defining the rules
 */
const rules = [
    {
        "id": 1,
        "title": "Rule 1",
        "method": 'return !!obj',
        "trueId": 4,
        "falseId": 3
    },
    {
        "id": 2,
        "title": "Rule 2",
        "method": "return obj.color == 'red'",
        "trueId": 4,
        "falseId": 4
    },
    {
        "id": 3,
        "title": "Rule 3",
        "method": "return obj.color == 'green'",
        "trueId": 2,
        "falseId": 5
    },
    {
        "id": 4,
        "title": "Rule 4",
        "method": "obj.color == 'green'",
        "trueId": 3,
        "falseId": 5
    },
    {
        "id": 5,
        "title": "Rule 5 (end rule)",
        "method": "return !!obj",
        "trueId": null,
        "falseId": null
    }
];

/**
 * Executes the Flow with a given JSON string parsed to a object literal.
 */
const obj = JSON.parse('{"color": "red"}');
let flow = new Flow(rules);
flow.init(obj);
