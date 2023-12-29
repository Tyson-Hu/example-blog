import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from "react";

import Button from "@/components/Button";
import Cursor from "@/components/Cursor";
import Header from "@/components/Header";
import data from "@/data/portfolio.json";
import { stagger } from "@/animations";
import { getAllPosts } from "@/utils/api";
import {Post} from "@/components/BlogEditor";
import { ISOtoDate, useIsomorphicLayoutEffect } from "@/utils";

interface BlogProps {
    posts: Post[];
}

const Blog: React.FC<BlogProps> = ({ posts }) => {
    const showBlog = useRef(data.showBlog);
    const text = useRef<HTMLHeadingElement | null>(null);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useIsomorphicLayoutEffect(() => {
        stagger(
            [text.current],
            { y: 40, x: -10, transform: "scale(0.95) skew(10deg)" },
            { y: 0, x: 0, transform: "scale(1)" },
        );
        if (showBlog.current) {
            stagger(
                [text.current],
                { y: 30 },
                { y: 0 },
            );
        } else {
            router.push("/");
        }
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    const createBlog = () => {
        if (process.env.NODE_ENV === "development") {
            fetch("/api/blog", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(() => {
                router.reload();
            });
        } else {
            alert("This feature is only available in development mode.");
        }
    };

    const deleteBlog = (slug: string) => {
        if (process.env.NODE_ENV === "development") {
            fetch("/api/blog", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ slug }),
            }).then(() => {
                router.reload();
            });
        } else {
            alert("This feature is only available in development mode.");
        }
    };

    return (
        showBlog && (
            <>
                {data.showCursor && <Cursor />}
                <Head>
                    <title>Blog</title>
                </Head>
                <div
                    className={`container mx-auto mb-10 ${
                    data.showCursor && "cursor-none"
                    }`}
                >
                    <Header isBlog={true} />
                    <div className="mt-10">
                        <h1
                            ref={text}
                            className="mx-auto mob:p-2 text-bold text-6xl laptop:text-8xl w-full"
                        >
                            Blog.
                        </h1>
                        <div className="mt-10 grid grid-cols-1 mob:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 justify-between gap-10">
                            {posts &&
                                posts.map((post) => (
                                    <div
                                        className="cursor-pointer relative"
                                        key={post.slug}
                                        onClick={() => router.push(`/blog/${post.slug}`)}
                                    >
                                        <img
                                            className="w-full h-60 rounded-lg shadow-lg object-cover"
                                            src={post.image}
                                            alt={post.title}
                                        />
                                        <h2 className="mt-5 text-4xl">{post.title}</h2>
                                        <p className="mt-2 opacity-50 text-lg">{post.preview}</p>
                                        <span className="text-sm mt-5 opacity-25">
                                            {ISOtoDate(post.date)}
                                        </span>
                                        {process.env.NODE_ENV === "development" && (
                                            <div className="absolute top-0 right-0">
                                                <Button
                                                    onClick={(e) => {
                                                        deleteBlog(post.slug);
                                                        e.stopPropagation();
                                                    }}
                                                    type={"primary"}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))};
                        </div>
                    </div>
                </div>
                {process.env.NODE_ENV === "development" && mounted && (
                    <div className="fixed bottom-6 right-6">
                        <Button onClick={createBlog} type={"primary"}>
                            Add New Post +{""}
                        </Button>
                    </div>
                )}
            </>
        )
    );
};

export const getStaticProps = async () => {
    const posts = getAllPosts([
        "slug",
        "title",
        "image",
        "preview",
        "author",
        "date",
    ]);

    return {
        props: {
            posts: [...posts],
        },
    };
}

export default Blog;
