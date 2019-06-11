package com.rasterfoundry.lambda.overviews

import java.io.{InputStream, OutputStream}

import com.amazonaws.services.lambda.runtime.{Context, RequestStreamHandler}
import com.typesafe.scalalogging.LazyLogging
import io.circe.parser.decode

import com.rasterfoundry.datamodel.OverviewInput

class LambdaHandler extends RequestStreamHandler with LazyLogging {

  def handleRequest(input: InputStream,
                    out: OutputStream,
                    context: Context): Unit = {
    val inputString = scala.io.Source.fromInputStream(input).mkString("")
    println(s"Received input: $inputString")
    decode[OverviewInput](inputString) match {
      case Right(overviewInput) =>
        OverviewGenerator.createOverview(overviewInput) match {
          case Some(204) =>
            println(
              s"Created overview and updated project layer: ${overviewInput.projectLayerId}")
          case Some(404) =>
            println(
              s"Cannot find project layer: ${overviewInput.projectLayerId}")
          case _ =>
            println(
              "Did not update project layer, scenes were stale prior to writing layer")
        }
      case Left(e) => throw e
    }
  }
}
