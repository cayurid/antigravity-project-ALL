import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    JoinTable,
} from 'typeorm';
import { User } from './User';
import { Project } from './Project';
import { Tag } from './Tag';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 50, default: 'todo' })
    status: 'todo' | 'in_progress' | 'done' | 'cancelled';

    @Column({ type: 'varchar', length: 50, default: 'medium' })
    priority: 'low' | 'medium' | 'high' | 'urgent';

    @Column({ type: 'timestamp', nullable: true })
    dueDate: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'int', default: 0 })
    order: number;

    // Relationships
    @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'varchar' })
    userId: string;

    @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @Column({ type: 'varchar', nullable: true })
    projectId: string;

    @ManyToMany(() => Tag, (tag) => tag.tasks, { cascade: true })
    @JoinTable({
        name: 'task_tags',
        joinColumn: { name: 'taskId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
    })
    tags: Tag[];
}
