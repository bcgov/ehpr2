import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { GenericError, MassEmailRecord, Recipient } from '@ehpr/common';

@Entity('mass_email_record')
export class MassEmailRecordEntity implements MassEmailRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'jsonb', nullable: false })
  recipients!: Recipient[];

  @Column({ type: 'varchar', length: 255 })
  subject!: string;

  @Column({ type: 'jsonb', default: null })
  errors?: GenericError[];

  @Column({ name: 'message_ids', type: 'jsonb', default: null })
  messageIds?: Record<string, string>;

  @CreateDateColumn()
  createdDate!: Date;

  @ManyToOne(() => UserEntity, record => record.massEmailRecords)
  user!: UserEntity;
}
