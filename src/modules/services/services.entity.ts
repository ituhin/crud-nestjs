import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ServiceStatus } from './interfaces/services.interface';

@Entity('services')
export class ServicesEntity extends BaseEntity {
  @PrimaryGeneratedColumn({unsigned: true})
  id: number;

  @Index("idx_name", { unique: true })
  @Column("varchar", { length: 16, nullable: false })
  name: string;

  @Index("idx_owner")
  @Column("varchar", { length: 32, nullable: false})
  owner: string;

  @Column('text', { nullable: false })
  description: string;

  @Column({
    type: "enum",
    enum: ServiceStatus,
    default: ServiceStatus.INACTIVE
  })
  status: string

  @Index('idx_createdAt')
  @CreateDateColumn({ type: 'timestamp', precision:0, default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true, precision:0, default: () => null, onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}