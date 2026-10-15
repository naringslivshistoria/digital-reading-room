/**
 * Which platforms (the reading room, Företagskällan) a user has access to.
 * All existing users get the reading room, so nothing changes for them.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('user_platforms', function (table) {
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
    table.text('platform').notNullable()
    table.timestamp('granted_at', { useTz: true }).defaultTo(knex.fn.now())
    table.primary(['user_id', 'platform'])
  })

  await knex.raw(`
    alter table user_platforms
    add constraint user_platforms_platform_check
    check (platform in ('readingroom', 'foretagskallan'))
  `)

  await knex.raw(`
    insert into user_platforms (user_id, platform)
    select id, 'readingroom' from users
  `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('user_platforms')
}
