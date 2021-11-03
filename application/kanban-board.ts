import { Kanban } from './namespaces/kanban-board';
import { Task } from "./models/task";
import { isMatch, remove } from 'lodash';

import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';

export class KanbanBoard {

    constructor(private _backlog = new KanbanBoard.InnerColumn('Backlog'),
      private _inProgress = new KanbanBoard.InnerColumn('In Progress'),
      private _complete = new KanbanBoard.InnerColumn('Complete'),
		  private currentTaskId: number = 0,
      private _db = new JsonDB(new Config("myDataBase", true, false, '/')))
     {
        //this._db = new Low(new JSONFile('db.json'))
     }
    /**
     * Getters
     */
    public get backlog(): Kanban.Board.Column { return this._backlog; }
    public get inProgress(): Kanban.Board.Column { return this._inProgress; }
    public get complete(): Kanban.Board.Column { return this._complete; }

    /**
     * Adders
     * @param task to add
     */
    public addToBacklog(task: Task) {
		this._backlog.add(Object.assign(new Task(''), task, { taskId: ++this.currentTaskId }));
	}
    public addToInProgress(task: Task) { this._inProgress.add(task); }
    public addToComplete(task: Task) { this._complete.add(task); }

    /**
     * Removers
     * @param task to remove.
     * Equality is determined by comparing name and author.
     */
    public removeFromBacklog(task: Task): void { this._backlog.remove(task); }
    public removeFromInProgress(task: Task): void { this._inProgress.remove(task); }
    public removeFromComplete(task: Task): void { this._complete.remove(task); }

    public remove(task: Task): void {
		this.removeFromBacklog(task);
		this.removeFromInProgress(task);
		this.removeFromComplete(task);
    }

    public clearBoard() {
        this._backlog.clear();
        this._inProgress.clear();
        this._complete.clear();
    }

    private getColumns(): Kanban.Board.Column[] {
        return [this._backlog, this._inProgress, this._complete];
	}

	private getAllTasks(): Task[] {
		return [...this._backlog.getTasks(), ...this._inProgress.getTasks(), ...this._complete.getTasks()];
	}

    private writeToDB() {
        // FIXME because they didn't make columns iterable we have to hardcode this; think about rewriting in the future
        //backlog
        var backlog_to_save = [ ];
        for( let j = 0; j < this._backlog.getTasks().length; j++ )
        {
            backlog_to_save.push(this._backlog.getTasks()[j].toObject());
        }
        //inprogress
        var inProgress_to_save = [ ];
        for( let j = 0; j < this._inProgress.getTasks().length; j++ )
        {
            inProgress_to_save.push(this._inProgress.getTasks()[j].toObject());
        }
        //complete
        var complete_to_save = [ ];
        for( let j = 0; j < this._complete.getTasks().length; j++ )
        {
            complete_to_save.push(this._complete.getTasks()[j].toObject());
        }

        // if (this._db != undefined ){
        //     this._db.data = { backlog_tasks: backlog_to_save, inProgress_tasks: inProgress_to_save, complete_tasks: complete_to_save };
        //     this._db.write();
        // }
    }

    //This only occurs on initialize, and only once!
    //private readFromDB():

    public containsTask(task: Task): boolean;
    public containsTask(taskName: string): boolean;
    public containsTask(taskOrTaskName: Task | string): boolean {
        try {
            const task: Task = Task.getTaskFromProperties(taskOrTaskName);
            const columns: Kanban.Board.Column[] = [...(this.getColumns().values())];
            return columns.some(column => column.contains(task));
        } catch (error) {
            // unable to determine task, so return false
            return false;
        }
	}

	public findMatch(task: Task): Promise<Task>;
	public findMatch(taskName: string): Promise<Task>;
	public findMatch(taskOrTaskName: Task | string): Promise<Task> {
		try {
			const task = Task.getTaskFromProperties(taskOrTaskName);
			const match: Task | undefined = this.getAllTasks().find(item => item.matches(task));

			if (!!match) {
				return Promise.resolve(match);
			}
			return Promise.reject(new Error('No match found'));
        } catch (error) {
            return Promise.reject(error);
        }
	}

    // have to do it this way for method overloading
    public checkColumnsForMatchingEntry(task: Task): string;
    public checkColumnsForMatchingEntry(taskName: string): string;
    public checkColumnsForMatchingEntry(taskOrTaskName: Task | string): string {
        const task: Task = Task.getTaskFromProperties(taskOrTaskName);
        this.getColumns().forEach(column => {
            if (column.contains(task)) {
                return column.getName();
            }
        })
        return 'None';
    }

    static InnerColumn = class implements Kanban.Board.Column {

        private _name: string;
        private _tasks: Task[];

        constructor(name: string, tasks: Task[] = []) {
            this._name = name;
            this._tasks = tasks;
        }

        getName(): string { return this._name; }
        getTasks(): Task[] { return this._tasks; }

        add(task: Task): void {
            this._tasks.push(task);

            console.log(this._tasks);
        }

        remove(task: Task): void {
			remove(this._tasks, task);
        }

        clear(): void {
            this._tasks = [];
        }

        contains(task: Task): boolean {
            return !!this.findMatch(task);
		}

		findMatch(task: Task): Task | undefined {
			return this._tasks.find(item => item.matches(task));
		}
    };
};

// const board = new KanbanBoard();
// board.addToBacklog(new Task('a'));
// board.addToBacklog({ name: 'a' } as Task);
// board.findMatch('a').then(value => console.log(value)).catch(() => console.log('fuck'));
