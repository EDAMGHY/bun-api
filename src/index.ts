import { serve } from "bun";
import type { IBlog } from "./types";
import { PrismaClient } from "@prisma/client";

const server = serve({
  async fetch(req) {
    // INIT PRISMA CLIENT
    const prisma = new PrismaClient();

    // CHECK FOR REQUEST PATH AND METHODS
    const path = new URL(req.url).pathname;
    const method = req.method;

    // ROUTES
    // @route GET("/")
    if (method === "GET" && path === "/") {
      return Response.json({ msg: "API Running...!" });
    }

    // @route GET("/blogs")
    if (method === "GET" && path === "/blogs") {
      const blogs: IBlog[] =
        (await prisma.blog.findMany({
          select: { id: true, title: true, content: true },
        })) || [];
      return Response.json({ success: true, data: blogs });
    }

    // @route POST("/blogs")
    if (method === "POST" && path === "/blogs") {
      const data = await req.json();
      const blog: IBlog = await prisma.blog.create({
        data: {
          title: data.title,
          content: data.content,
        },
      });

      return Response.json({ success: true, data: blog });
    }

    return Response.json({ msg: "404! This route doesn't exist" });
  },
});

console.log(`Listening on http://localhost:${server.port}...`);
