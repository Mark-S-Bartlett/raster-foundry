package com.rasterfoundry.database

import doobie.implicits._
import org.scalatest._

class ToolCategoryToToolDaoSpec
    extends FunSuite
    with Matchers
    with DBTestConfig {
  test("selection types") {
    xa.use(t => ToolCategoryToToolDao.query.list.transact(t))
      .unsafeRunSync
      .length should be >= 0
  }
}
