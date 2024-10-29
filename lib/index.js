"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class StateMachine {
    constructor(config, context) {
        this.saveHistory = (state) => {
            this.history.push(state);
        };
        this.runOnEntry = (state, context) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if ((_a = this.config.state[state]) === null || _a === void 0 ? void 0 : _a.onEntry) {
                yield this.config.state[state].onEntry(context);
            }
        });
        this.runOnExit = (state, context) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if ((_a = this.config.state[state]) === null || _a === void 0 ? void 0 : _a.onExit) {
                yield this.config.state[state].onExit(context);
            }
        });
        this.setCurrentState = (state) => __awaiter(this, void 0, void 0, function* () {
            this.currentState = state;
            this.saveHistory(state);
        });
        this.transition = (event) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const currentStateObj = this.config.state[this.currentState];
            if (((_a = currentStateObj === null || currentStateObj === void 0 ? void 0 : currentStateObj.on) === null || _a === void 0 ? void 0 : _a[event]) === undefined) {
                console.log(`${event} is not valid in ${this.getCurrentState()}`);
                return false;
            }
            if (event in currentStateObj.on) {
                const nextState = currentStateObj.on[event];
                yield this.runOnExit(this.currentState, this.context);
                yield this.setCurrentState(nextState);
                yield this.runOnEntry(this.currentState, this.context);
                return true;
            }
            return false;
        });
        this.config = config;
        this.context = context;
        this.currentState = config.initial;
        this.history = [config.initial];
    }
    getCurrentState() {
        return this.currentState;
    }
    getContext() {
        return this.context;
    }
    getHistory() {
        return this.history;
    }
}
const documentConfig = {
    state: {
        draft: {
            on: {
                submit: 'review'
            },
            onEntry: (context) => {
                context.lastModified = new Date();
            }
        },
        review: {
            on: {
                approve: 'published',
                reject: 'draft'
            }
        },
        published: {
            on: {
                revise: 'draft'
            }
        }
    },
    initial: 'draft'
};
const machine = new StateMachine(documentConfig, {
    content: 'Lorem Ipsum',
    lastModified: new Date(),
    author: 'John'
});
const logCurrentStateAndContext = () => {
    console.log('\nCurrent State:', machine.getCurrentState(), '\nContext:', machine.getContext());
};
const triggerAndLogEvent = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\n---------------------------');
    console.log(`\nSending event '${event}' in current state: ${machine.getCurrentState()}`);
    yield machine.transition(event);
    logCurrentStateAndContext();
});
const testStateMachine = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('State machine test');
    console.log('Initial state');
    logCurrentStateAndContext();
    yield triggerAndLogEvent('submit');
    yield triggerAndLogEvent('approve');
    yield triggerAndLogEvent('revise');
    console.log('\nHistory:', machine.getHistory());
    console.log('\n---------------------------FINISH');
});
testStateMachine();
