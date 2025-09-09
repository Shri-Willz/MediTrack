import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { insertUserSchema } from "@shared/schema";
import { Link } from "react-router";
import { useSignUp } from "@clerk/clerk-react";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";


const formschema = insertUserSchema.extend({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Only letters, numbers, and underscores allowed",
    }),

  email: z
    .string()
    .email({ message: "Invalid email address" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
      message:
        "Must include uppercase, lowercase, number, and special character",
    }),
});


type FormValues = z.infer<typeof formschema>

const otpScehma = z.object({
  otp: z.string()
})

type otp = z.infer<typeof otpScehma>

export default function SignUp() {

  const { isLoaded, setActive, signUp } = useSignUp()
  const [showpassword, setshowpassword] = useState(false)
  const [pendingverification, setpendingverification] = useState(false)
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(true)
  const [error, seterror] = useState("")
  const [alert, setalert] = useState(false)
  const { isSignedIn } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(formschema),
    defaultValues:
    {
      username: "",
      email: "",
      password: ""
    }
  })

  const otpform = useForm<otp>({
    resolver: zodResolver(otpScehma),
    defaultValues: {
      otp: ""
    }
  })

  if (isSignedIn) {
    navigate("/dashboard")
  }

  if (!isLoaded) {
    return null;
  }
     const createuser = useMutation({
        mutationFn: async ({username,email,password}:{username:string, email:string,password:string}) => {
          return apiRequest('post', `api/users`, {username,email,password})
        },
        onSuccess:()=>{
          console.log("created")
        },
        onError:(err) => {
          toast({
            title: "Error",
            description: "Failed to create account. Please try again.",
            variant: "destructive",
          })
        }
      })



  const onSubmit = async (values: FormValues) => {
    if (!isLoaded) return;

    try {

      await signUp.create({
        emailAddress:values.email,
        password:values.password,
        username:values.username
      })

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setpendingverification(true);

      createuser.mutate({
        username:values.username,
        email:values.email,
        password:values.password
      })
   } 
    catch (err: any) {
      console.error("Sign-up error:", JSON.stringify(err, null, 2));
      const firstError = err?.errors?.[0]?.message || "Unknown error occurred";
      seterror(firstError)
      setalert(true)
    }
  };

const handleOtp = async (values: otp) => {
  if (!isLoaded) return;

  try {
    const completeSignUp = await signUp.attemptEmailAddressVerification({ code: values.otp });

    if (completeSignUp.status === "complete") {
      await setActive({ session: completeSignUp.createdSessionId });
      navigate("/dashboard");

    } else {
      console.warn("Sign-up not complete:", JSON.stringify(completeSignUp, null, 2));
    }

  } catch (err: any) {
    console.error("OTP verification error:", JSON.stringify(err, null, 2));
    const firstError = err?.errors?.[0]?.message || "Verification failed";
  }
};


return (
  <div className="flex flex-col justify-center min-h-screen items-center">
    {
      !pendingverification ?
        <div>
          <Card className="w-[350px] lg:w-[500px]">
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Create your account with <span className="text-primary">MediTrack</span></CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel> Name </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your name" {...field}
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel> Email </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your Email" {...field}
                              type="text">
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
                          <FormLabel> Password </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your password" {...field}
                              type={
                                showpassword ? "text" : "password"
                              }
                              className="relative">
                            </Input>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setshowpassword(!showpassword)
                      }}
                      className="pt-2 pl-1">
                      {
                        showpassword ? <p>
                          Hide Password
                        </p> : <p>
                          Show Password
                        </p>
                      }
                    </button>
                  </div>
                  <div className=" flex flex-col justify-center g">
                    <CardFooter className="flex flex-col gap-2 ">
                      <Button type="submit" className="w-2/3">Create an Account</Button>
                      <p>
                        already have an account?
                        <Link to="/" className="text-primary"> Sign in</Link>
                      </p>
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
        :
        <div className="flex items-center">
          <Dialog open={openDialog} onOpenChange={setOpenDialog} >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  Email Verification
                </DialogTitle>
                <DialogDescription>
                  Enter the 6 Digit verification code sent to your email
                </DialogDescription>
              </DialogHeader>
              <Form {...otpform} >
                <form onSubmit={otpform.handleSubmit(handleOtp)} className="flex flex-col items-center">
                  <FormField
                    control={otpform.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" className="mt-4">Verify email</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
    }
  </div>
)
}