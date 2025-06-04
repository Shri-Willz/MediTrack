import { Input } from "@/components/ui/input";
import React, { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useSignIn } from "@clerk/clerk-react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNavigate } from "react-router";






export default function ForgotPassword() {
    const [email, setemail] = useState("")
    const { isLoaded, signIn, setActive } = useSignIn()
    const [verification, setverification] = useState(false)
    const [otpvalues, setotpvalues] = useState("")
    const [error, seterror] = useState("")
    const [alert, setalert] = useState(false)
    const [newPassword, setnewPassword] = useState("")
    const [newPasswordfelid, setnewPasswordfelid] = useState(false)
    const navigate = useNavigate()


    if (!isLoaded) {
        return null;
    }

    const emailVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await signIn?.create({
                strategy: "reset_password_email_code",
                identifier: email,
            })
            setverification(true)
        }
        catch (err: any) {
            console.error("OTP verification error:", JSON.stringify(err, null, 2));
            const firstError = err?.errors?.[0]?.message || "Verification failed";
            seterror(firstError)
            setalert(true)
        }

    }

    const handleOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setnewPasswordfelid(true)
        console.log(newPasswordfelid)
    }

    const handleResetPass = async (e: React.FocusEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            const result = await signIn?.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code: otpvalues,
                password: newPassword
            })

            if (result.status === "complete")
                setActive({session: result.createdSessionId })
                seterror("") 
                navigate("/dashboard")

        }
        catch (err: any) {
            console.error("Something Went Wrong:", JSON.stringify(err, null, 2));
            const firstError = err?.errors?.[0]?.message || "Verification failed";
            seterror(firstError)
            setalert(true)
        }

    }

    return (

        <div className="flex flex-col">
            {
                !verification ?
                    <div className="flex flex-col">
                        <Dialog open={true}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Email Verification
                                    </DialogTitle>
                                    <DialogDescription>
                                        Enter the your email id
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={emailVerify} className="w-[350px]">
                                    <Input
                                        placeholder="Enter your Email"
                                        type="text"
                                        onChange={(e) => setemail(e.target.value)}
                                        value={email}>
                                    </Input>
                                    <DialogFooter>
                                        <Button type="submit" className=" mt-4 w-1/3">Verify</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    :
                    <div className="flex">
                        <Dialog open={true} onOpenChange={setverification}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        OTP
                                    </DialogTitle>
                                    <DialogDescription>
                                        Enter the 6 Digit verification code sent to your email
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleOtp}>
                                    <InputOTP maxLength={6} onChange={(e) => setotpvalues(e)}  >
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
                                    <DialogFooter className="mt-2">
                                        <Button type="submit" className="w-1/3" >Verify</Button>
                                    </DialogFooter>
                                </form>

                            </DialogContent>
                        </Dialog>
                    </div>
            }
            <Dialog open={newPasswordfelid} onOpenChange={setnewPasswordfelid}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                           New Password
                        </DialogTitle>
                        <DialogDescription>
                            Enter New Password
                        </DialogDescription>
                    </DialogHeader>
                    <form className="flex flex-col" onSubmit={handleResetPass}>
                        <Input
                            placeholder="Enter your New Password"
                            type="text"
                            onChange={(e) => setnewPassword(e.target.value)}
                            value={newPassword}>
                        </Input>
                        <DialogFooter className=" mt-4 w-2/3">
                            <Button type="submit" >Confirm</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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