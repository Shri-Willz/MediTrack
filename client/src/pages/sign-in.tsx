import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom"
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom'
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@clerk/clerk-react";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "The password should contain atleast 8 characters")
});

type FormValues = z.infer<typeof schema>;


export default function signin() {
    const { isLoaded, setActive, signIn } = useSignIn()
    const navigate = useNavigate();
    const [error, seterror] = useState("");
    const [alert, setalert] = useState(false)
    const { isSignedIn } = useAuth()



    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues:
        {
            email: "",
            password: ""

        }

    })

    if (isSignedIn) {
        navigate("/dasahboard")
    }

    if (!isLoaded) {
        return null;
    }

    const onSubmit = async (values: FormValues) => {

        if (!isLoaded) return;

        try {
            const result = await signIn.create({
                identifier: values.email,
                "password": values.password
            });
            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                navigate("/dashboard");
            } else {
                console.error(JSON.stringify(result, null, 2));
            }
        }
        catch (err: any) {
            console.error("Sign-in error:", JSON.stringify(err, null, 2));
            const firstError = err?.errors?.[0]?.message || "Unknown error occurred";
            seterror(firstError)
            setalert(true)
        }
    }

    return (
        <div className="flex flex-col justify-center min-h-screen items-center">
            <Card className="w-[350px] lg:w-[500px]">
                <CardHeader>
                    <CardTitle>
                        Welcome back to <span className="text-primary">Meditrack</span>
                    </CardTitle>
                    <CardDescription>
                        Don't have an account? <Link to="/signup" className="text-primary">Sign up</Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your register email"{...field}
                                                    type="text"
                                                >
                                                </Input>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your password"{...field}
                                                    type="text"
                                                >
                                                </Input>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Link to={"/forgotpass"} className="text-primary mt-2 ml-1">
                                    Forgot Password
                                </Link>
                            </div>
                            <div>
                                <CardFooter className=" flex flex-col justify-center">
                                    <Button type="submit" className="w-2/3">Create an Account</Button>
                                </CardFooter>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <AlertDialog open={alert} onOpenChange={setalert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Error!</AlertDialogTitle>
                        <AlertDialogDescription>
                            {
                                error
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
