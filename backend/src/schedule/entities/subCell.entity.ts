import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { SubGroup } from 'src/group/entities/subGroup.entity';
import { Cell } from './cell.entity';
import { Lesson } from './lesson.entity';
import { periodEnum } from '../enums/period.enum'

@Entity({name: "sub_cell"})
export class SubCell {
    
    @Column('enum', { enum: periodEnum })
    period: periodEnum;

    @ManyToOne(() => SubGroup, subGroup => subGroup.subCells)
    subGroup: SubGroup;

    @ManyToOne(() => Cell, cell => cell.subCells)
    cell: Cell;

    @OneToOne(() => Lesson)
    @JoinColumn()
    lesson: Lesson;


}