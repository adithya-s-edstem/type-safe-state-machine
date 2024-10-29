interface StateMachineConfig<
  TState extends string,
  TEvent extends string,
  TContext extends object
> {
  state: Record<TState, {
    on?: Partial<Record<TEvent, TState>>;
    onEntry?: (context: TContext) => Promise<void> | void;
    onExit?: (context: TContext) => Promise<void> | void;
  }>;
  initial: TState;
}

class StateMachine<
  TState extends string,
  TEvent extends string,
  TContext extends object
> {
  config;
  context;
  currentState;
  history: string[];

  constructor(config: StateMachineConfig<TState, TEvent, TContext>, context: TContext) {
    this.config = config;
    this.context = context;
    this.currentState = config.initial;
    this.history = [config.initial];
  }

  saveHistory = (state: TState): void => {
    this.history.push(state);
  }

  runOnEntry = async (state: TState, context: TContext): Promise<void> => {
    if (this.config.state[state]?.onEntry) {
      await this.config.state[state].onEntry(context);
    }
  }

  runOnExit = async (state: TState, context: TContext): Promise<void> => {
    if (this.config.state[state]?.onExit) {
      await this.config.state[state].onExit(context);
    }
  }

  setCurrentState = async (state: TState): Promise<void> => {
    this.currentState = state;
    this.saveHistory(state);
  }

  transition = async (event: TEvent): Promise<boolean> => {
    const currentStateObj = this.config.state[this.currentState];
    if (currentStateObj?.on?.[event] === undefined) {
      console.log(`${event} is not valid in ${this.getCurrentState()}`);
      return false;
    }
    if (event in currentStateObj.on) {
      const nextState = currentStateObj.on[event];
      await this.runOnExit(this.currentState, this.context);
      await this.setCurrentState(nextState);
      await this.runOnEntry(this.currentState, this.context);
      return true;
    }
    return false;
  }

  getCurrentState(): TState {
    return this.currentState;
  }
  getContext(): TContext {
    return this.context;
  }
  getHistory(): string[] {
    return this.history;
  }
}

type DocumentState = 'draft' | 'review' | 'published';
type DocumentEvent = 'submit' | 'approve' | 'reject' | 'revise';

interface DocumentContext {
  content: string;
  lastModified: Date;
  author: string
}

const documentConfig: StateMachineConfig<DocumentState, DocumentEvent, DocumentContext> = {
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
}

const machine = new StateMachine(documentConfig, {
  content: 'Lorem Ipsum',
  lastModified: new Date(),
  author: 'John'
})

const logCurrentStateAndContext = () => {
  console.log('\nCurrent State:', machine.getCurrentState(), '\nContext:', machine.getContext());
}

const triggerAndLogEvent = async (event: DocumentEvent): Promise<void> => {
  console.log('\n---------------------------');
  console.log(`\nSending event '${event}' in current state: ${machine.getCurrentState()}`);
  await machine.transition(event);
  logCurrentStateAndContext();
}

const testStateMachine = async () => {
  console.log('State machine test');
  console.log('Initial state');
  logCurrentStateAndContext();

  await triggerAndLogEvent('submit')
  await triggerAndLogEvent('approve');
  await triggerAndLogEvent('revise');

  console.log('\nHistory:', machine.getHistory());
  console.log('\n---------------------------FINISH');
}

testStateMachine();
