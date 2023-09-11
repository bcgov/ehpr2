import { Column, Entity } from 'typeorm';
import { Role, User } from '@ehpr/common';
import { BaseEntity } from '../../database/base.entity';

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
}
