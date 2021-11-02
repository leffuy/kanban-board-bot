import { trim } from "lodash";

export enum KanbotCommands {
    ADD,
    ASSIGN,
    CLEAR,
    COMPLETE,
    HELP,
    REMOVE,
    START
}

function getKanbotCommand(command: string): KanbotCommands {
    switch (command) {
        case 'add':
            return KanbotCommands.ADD;
        case 'assign':
            return KanbotCommands.ASSIGN;
        case 'clear':
            return KanbotCommands.CLEAR;
        case 'complete':
            return KanbotCommands.COMPLETE;
        case 'remove':
            return KanbotCommands.REMOVE;
        case 'start':
            return KanbotCommands.START;
        case 'help':
        default:
            return KanbotCommands.HELP;
    }
}

export interface KanbotRequest {
    command: KanbotCommands;
    taskName: string;
    additionalArgs: string;
}

export class KanbotRequest implements KanbotRequest {

    constructor(command: KanbotCommands, taskName: string, additionalArgs: string) {
        this.command = command;
	      this.taskName = taskName;
	      this.additionalArgs = additionalArgs; //ideally can be split by spaces
    }

    // FIXME: Right now we assume the only argument in quotes would be the taskname
    //        thus all other arguments past next to it not in quotes will be "singular"
    //        in future need clean up command parsing to be more similar to configuration as
    //        something like argparse in python

    // TODO: Replace with argparser or expand into a custom argparser
    public static parseString(input: string): KanbotRequest {
        // split on first space - won't work if we allow commands to have multiple arguments
        const spaceIndex: number = input.indexOf(' ');
        const command: KanbotCommands = getKanbotCommand(input.substring(0, spaceIndex));
	      //const taskName: string = `${trim(input.substring(spaceIndex + 1, input.length), '"')}`;

        const optArgvRaw = input.match(/".+?"/g);
        var optArgv = null;
        var remainingOptArgs = "";
        var remainingOptArgv = null

        //get args in quotes then remove them from the arg string
        if( optArgvRaw != null ){
            optArgv = optArgvRaw.map(str => str.replace(/"/g, ''));
            if(optArgv != null ){
                //we assume 1 and only 1 argument in quotes will ever exist
                if( optArgv[0] != null ){ //starting to bug me but necessary
                  // arguments that are remaining to be mutexed with
		  remainingOptArgs = input.replace(optArgv[0], "").replace(input.substring(0, spaceIndex), "").replace('""', '').replace(/\s/g, '');
                }
            }
            console.log(`remaining argv: ${remainingOptArgs}`);
            console.log(`Opt argv ${optArgvRaw} and ${optArgv[0]}`);
        }

        //when we fill this it will be mutually exclusive
        var tmp_taskName: string = "";
        var tmp_additionalArgs: string = "";

        if( remainingOptArgs != null ){
          tmp_additionalArgs = remainingOptArgs;
        }

        if( optArgv != null){
            if( optArgv[0] != null && (tmp_taskName == ""|| tmp_additionalArgs == null)){
                 tmp_taskName = `${trim(optArgv[0], '"')}`;
                 console.log(`taskname ${tmp_taskName}`);
            }
            if( optArgv[1] != null ){
                 tmp_additionalArgs = `${trim(optArgv[1], '"')}`;
                 console.log(`additionalArgs ${tmp_additionalArgs}`);
            }
        }

      	const taskName: string = tmp_taskName;
      	const additionalArgs: string = tmp_additionalArgs;
        return new KanbotRequest(command, taskName, additionalArgs);
    }
}
