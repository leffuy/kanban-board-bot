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
	this.additionalArgs = additionalArgs;
    }

    public static parseString(input: string): KanbotRequest {
        // split on first space - won't work if we allow commands to have multiple arguments
        const spaceIndex: number = input.indexOf(' ');
        const command: KanbotCommands = getKanbotCommand(input.substring(0, spaceIndex));
	//const taskName: string = `${trim(input.substring(spaceIndex + 1, input.length), '"')}`;

        const optArgvRaw = input.match(/".+?"/g);
        var optArgv = null;
        if( optArgvRaw != null ){
            optArgv = optArgvRaw.map(str => str.replace(/"/g, ''));
            console.log(`Opt argv ${optArgvRaw} and ${optArgv[0]}`);
        }

        var tmp_taskName: string = "";
        var tmp_additionalArgs: string = "";

	if( optArgv != null){
            if( optArgv[0] != null ){
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
