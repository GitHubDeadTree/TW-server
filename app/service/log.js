'use strict'

const Service = require('egg').Service
const { markdown } = require('js-ant')

class LogService extends Service {

  async create(data) {
    const { ctx } = this
    const uid = ctx.user.uid
    return ctx.model.Log.create({ uid, ...data })
  }

  async findAllByUid(query) {
    const { ctx, app } = this
    const uid = ctx.user.uid
    const pageNo = Number(query.pageNo) || 0
    const pageSize = Number(query.pageSize) || Number.MAX_SAFE_INTEGER

    const SQL_ROWS = `
    SELECT
        l.id as id,
        l.uid as uid,
        l.log_type as logType,
        l.done_content as doneContent,
        l.undone_content as undoneContent,
        l.plan_content as planContent,
        l.summary_content as summaryContent,
        l.company_id as companyId,
        l.created_at as createdAt,
        l.updated_at as updatedAt,
        c.company_name as companyName
    FROM logs AS l
    LEFT JOIN company AS c ON l.company_id = c.id
    WHERE l.uid = ?
    ORDER BY l.created_at DESC
    LIMIT ?, ?;
    `

    const SQL_COUNT = `
    SELECT
        l.id
    FROM logs AS l
    LEFT JOIN company AS c ON l.company_id = c.id
    WHERE l.uid = ?
    `

    const queyRows = ctx.model.query(SQL_ROWS, {
      replacements: [uid, pageNo, pageSize * (pageNo + 1)],
      raw: true,
      type: app.Sequelize.QueryTypes.SELECT
    })
    const queryCount = ctx.model.query(SQL_COUNT, {
      replacements: [uid],
      raw: true,
      type: app.Sequelize.QueryTypes.SELECT
    })

    const [rows, count] = await Promise.all(
      [queyRows, queryCount]
    )

    return {
      rows,
      count: count.length,
    }
  }

  async findByPk(id) {
    const { ctx } = this
    const uid = ctx.user.uid
    const result = await ctx.model.Log.findByPk(id, { where: { uid }, raw: true })
    return result
  }

  /**
   * 更新
   * @param {String} id
   * @param {Object} updateFields
   * @return {Promise}
   */
  async updateById(id, updateFields) {
    const { ctx } = this
    const uid = ctx.user.uid
    return ctx.model.Log.update(updateFields, { where: { uid, id } })
  }

  async deleteById(id) {
    const { ctx } = this
    const uid = ctx.user.uid
    return ctx.model.Log.destroy({ where: { uid, id } })
  }
}

module.exports = LogService
