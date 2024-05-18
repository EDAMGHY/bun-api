import { serve } from "bun";
import type { IBlog, IBlogData } from "./types";
import { PrismaClient } from "@prisma/client";
import { setFailedResponse, setSuccessResponse } from "./utils";

const server = serve({
  async fetch(req) {
    // INIT PRISMA CLIENT
    const prisma = new PrismaClient();

    // CHECK FOR REQUEST PATH AND METHODS
    const path = new URL(req.url).pathname;
    const method = req.method;
    const query = new URL(req.url).searchParams;

    // ROUTES
    // @route GET("/")
    if (method === "GET" && path === "/") {
      return Response.json({ message: "API Running...!" });
    }

    // @route GET("/blogs")
    if (method === "GET" && path === "/blogs" && !query.get("id")) {
      try {
        const blogs: IBlog[] =
          (await prisma.blog.findMany({
            select: { id: true, title: true, content: true },
          })) || [];
        return Response.json({ success: true, data: blogs });
      } catch (err) {
        return Response.json(setFailedResponse(err?.toString()), {
          status: 500,
        });
      }
    }

    // @route GET("/blogs?id=1")
    if (method === "GET" && path === "/blogs" && query.get("id")) {
      try {
        const id = query.get("id")!;

        if (id && isNaN(Number(id))) {
          throw new Error(`This is not a valid ID: ${id}`);
        }

        const blog = await prisma.blog.findUnique({
          where: {
            id: +id,
          },
        });

        if (!blog) {
          throw new Error(`There is no Blog with ID : ${id}`);
        }

        return Response.json(
          setSuccessResponse(`Blog with the ID: ${id} Fetched...`, blog),
          {
            status: 200,
          }
        );
      } catch (err) {
        return Response.json(setFailedResponse(err?.toString()), {
          status: 500,
        });
      }
    }

    // @route POST("/blogs")
    if (method === "POST" && path === "/blogs") {
      try {
        const { title, content } = (await req?.json()) || null;

        if (!title || !content) {
          throw new Error(`All fields should be filled!`);
        }

        const blog: IBlog = await prisma.blog.create({
          data: {
            title,
            content,
          },
        });

        return Response.json(setSuccessResponse("Blog Created...", blog), {
          status: 201,
        });
      } catch (err) {
        return Response.json(setFailedResponse(err?.toString()), {
          status: 500,
        });
      }
    }

    // @route PATCH("/blogs?id")
    if (method === "PATCH" && path === "/blogs" && query.get("id")) {
      try {
        const id = query.get("id")!;
        const { title, content } = (await req?.json()) || null;

        if (id && isNaN(Number(id))) {
          throw new Error(`This is not a valid ID: ${id}`);
        }

        const data: IBlogData = {};

        if (title) data.title = title;
        if (content) data.content = content;

        const blog: IBlog = await prisma.blog.update({
          where: {
            id: +id,
          },
          data,
        });

        return Response.json(setSuccessResponse("Blog Updated...", blog), {
          status: 200,
        });
      } catch (err) {
        return Response.json(setFailedResponse(err?.toString()), {
          status: 500,
        });
      }
    }

    // @route DELETE("/blogs?id")
    if (method === "DELETE" && path === "/blogs" && query.get("id")) {
      try {
        const id = query.get("id")!;

        if (id && isNaN(Number(id))) {
          throw new Error(`This is not a valid ID: ${id}`);
        }

        const blog = await prisma.blog.findUnique({
          where: {
            id: +id,
          },
        });

        if (!blog) {
          throw new Error(`There is no Blog with ID : ${id}`);
        }

        await prisma.blog.delete({
          where: {
            id: +id,
          },
        });

        return Response.json(setSuccessResponse("Blog Deleted...", null), {
          status: 200,
        });
      } catch (err) {
        return Response.json(setFailedResponse(err?.toString()), {
          status: 500,
        });
      }
    }

    return Response.json(setFailedResponse("404! This route doesn't exist"));
  },
});

console.log(`Listening on http://localhost:${server.port}...`);
