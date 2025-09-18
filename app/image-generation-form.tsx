"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { generateImage } from "@/server/image"
import { useState } from "react"
import Image from "next/image"

const formSchema = z.object({
    prompt: z.string(),
})

export function ImageGenerationForm() {
    const [image, setImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true)
            const image = await generateImage(values.prompt)
            setImage(image)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prompt</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Describe your image..." {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your public display name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button disabled={isLoading} type="submit" className="w-full">
                        {isLoading ? "Generating..." : "Generate Image"}
                    </Button>
                </form>
            </Form>

            {image && (
                <Image
                    src={image}
                    alt="Generated Image"
                    width={1000}
                    height={1000} />
            )}
        </>
    )
}