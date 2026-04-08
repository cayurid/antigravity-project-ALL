import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Task } from './Task';

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 50, default: 'active' })
    status: 'active' | 'archived' | 'deleted';

    @Column({ type: 'varchar', length: 7, default: '#3498db' })
    color: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    icon: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    archivedAt: Date;

    // Relationships
    @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ownerId' })
    owner: User;

    @Column({ type: 'varchar' })
    ownerId: string;

    @OneToMany(() => Task, (task) => task.project, { cascade: true })
    tasks: Task[];
}
