import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Role, User } from '@ehpr/common';
import { BaseEntity } from '../../database/base.entity';
import { MassEmailRecordEntity } from 'src/mass-email-record/entity/mass-email-record.entity';
import { HealthAuthoritiesEntity } from './ha.entity';

@Entity('user')
export class UserEntity extends BaseEntity implements User {
  @Column('varchar', { nullable: true })
  name!: string;

  @Column({ type: 'enum', enum: Role, default: Role.Pending })
  role!: Role;

  @Column({ type: 'varchar', nullable: true })
  email!: string;

  @Column({ type: 'bool', default: false })
  active!: boolean;

  @Column({ type: 'timestamp', default: null })
  revokedDate!: Date | null;

  @OneToMany(() => MassEmailRecordEntity, record => record.user)
  massEmailRecords!: MassEmailRecordEntity[];

  @Column('integer')
  ha_id!: number;

  @ManyToOne(() => HealthAuthoritiesEntity)
  @JoinColumn({ name: 'ha_id' })
  ha!: HealthAuthoritiesEntity;
}
