import {UndoableCommand} from 'interacto';
import {DataService} from '@/App.vue';

export class ClearText extends UndoableCommand {
    private memento: string = '';

    public constructor(private data: DataService) {
        super();
    }

    protected createMemento(): void {
        this.memento = this.data.txt;
    }

    protected execution(): void {
        this.data.txt = '';
    }

    public undo(): void {
        this.data.txt = this.memento;
    }

    public redo(): void {
        this.execution();
    }

    public getUndoName(): string {
        return 'Clear text';
    }
}
