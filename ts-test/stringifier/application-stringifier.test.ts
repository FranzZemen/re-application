import chai from 'chai';
import 'mocha';
import {ApplicationParser, ApplicationScope, ApplicationStringifier} from '../../publish';


const expect = chai.expect;
const should = chai.should();

const unreachableCode = false;

const parser = new ApplicationParser();
const stringifier = new ApplicationStringifier();

const scope = new ApplicationScope();

describe('Rules Engine Tests', () => {
  describe('Application Stringifier Tests', () => {
    describe('core/application/stringifier/application-stringifier.test', () =>{
      it ('should stringify "5 = test <<rs name="RuleSet2">> 6 < ab', done => {
        const [remaining, applicationReference] = parser.parse('<<ru name=Rule1>> 5 = test <<rs name="RuleSet2">> <<ru name=Rule2>> 6 < ab');
        const stringified = stringifier.stringify(applicationReference, scope);
        stringified.should.equal('<<ap name=Default>> <<rs name=Default>> <<ru name=Rule1>> 5 = test <<rs name=RuleSet2>> <<ru name=Rule2>> 6 < ab');
        done();
      })
    })
  })
})


