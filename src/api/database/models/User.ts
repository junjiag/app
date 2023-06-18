import type {
  InferAttributes,
  InferCreationAttributes, NonAttribute,
} from "sequelize";
import {
  AllowNull,
  BelongsToMany,
  Column,
  Table,
} from "sequelize-typescript";
import Fix from "../modelHelpers/Fix";
import ParanoidModel from "../modelHelpers/ParanoidModel";
import { JSONB, STRING } from "sequelize";
import ZodColumn from "../modelHelpers/ZodColumn";
import { Role, zRoleArr } from "../../../shared/RBAC";
import Group from "./Group";
import GroupUser from "./GroupUser";

@Table({ tableName: "users", modelName: "user" })
@Fix
class User extends ParanoidModel<
  InferAttributes<User>,
  InferCreationAttributes<User>
  > {
  @Column(STRING)
  name: string;

  @Column(STRING)
  pinyin: string;

  @Column({
    type: STRING,
    unique: true,
  })
  email: string;

  @Column({
    type: STRING,
    unique: true,
  })
  clientId: string;

  @ZodColumn(JSONB, zRoleArr)
  roles: Role[];

  @BelongsToMany(() => Group, { through: () => GroupUser })
  groups: NonAttribute<Group[]>;
}

export default User;