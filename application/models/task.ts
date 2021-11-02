import { isEqual, isMatch } from "lodash";

interface ITask {
    readonly name: string;
    readonly creator?: string;
    readonly taskId?: number;

    matches: (other: Task) => boolean;
    toString: () => string;
    toObject: () => Object;
}

export enum Status {
    BACKLOG = 'backlog',
    IN_PROGRESS = 'in progress',
    COMPLETE = 'complete'
}

export class Task implements ITask {

    private _status?: Status;
    private _assignee?: string;
    private _assigneeName?: string;

    constructor(readonly name: string, readonly creator?: string, status?: Status, readonly taskId?: number, assignee?: string, assigneeName?: string) {
        this._status = status;
        this._assignee = assignee;
        this._assigneeName = assigneeName;
    }

    set status(newStatus: Status) {
        this._status = newStatus;
    }

    set assignee(newAssignee: string) {
        this._assignee = newAssignee;
    }

    static getTaskFromProperties(taskOrTaskName: Task | string): Task {
        if (taskOrTaskName instanceof Task) {
            return taskOrTaskName;
        }
        return new Task(taskOrTaskName);
    }

    /**
     * Compare by name for now - in the future, enforce by id
     */
    matches(other: Task): boolean {
        return this.name === other.name;
    }

    equals(other: Task): boolean {
        return isEqual(this, other);
    }

    toObject() {
        return {
            name: this.name,
            assignee: this._assignee,
            assigneeName: this._assigneeName,
            taskId: this.taskId,
            status: this._status
        };
    }

    // Don't like this format modifying
    toString(): string {
	// return `[id: ${this.taskId}, name: "${this.name}", assignee: ${this.assignee}] created by ${this.creator}`;
        if( this._assignee != undefined && this._assignee != null ) return `${this.taskId} - "${this.name}" assigned to: ${this._assigneeName}`;
        else return `${this.taskId} - "${this.name}" not assigned`;
    }
}
