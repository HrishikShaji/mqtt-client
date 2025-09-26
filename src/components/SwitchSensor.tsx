import { Droplets, MapPin, Power, Send, Thermometer, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MqttClient } from "mqtt";
import { Button } from "./ui/button";
import useSwitchSensor from "@/features/switch/hooks/useSwitchSensor";

interface Props {
	client: MqttClient;
	isConnected: boolean;
}


export default function SwitchSensor({ client, isConnected }: Props) {
	const { switchState, toggleSwitch } = useSwitchSensor({ client, isConnected })
	return (
		<Card className="border-2">
			<CardHeader className="text-center">
				<CardTitle className="flex items-center justify-center gap-2 text-2xl">
					<Power className="h-6 w-6" />
					Main Switch Control
				</CardTitle>
				<CardDescription>Control the main device switch remotely</CardDescription>
			</CardHeader>
			<CardContent className="space-y-8">
				<div className="flex flex-col items-center space-y-6">
					<Button
						onClick={toggleSwitch}
						disabled={!isConnected}
						size="lg"
						variant={switchState ? "default" : "outline"}
						className={`h-20 w-40 text-xl font-bold transition-all duration-300 ${switchState
							? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25"
							: "hover:bg-muted"
							} ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
					>
						{switchState ? "ON" : "OFF"}
					</Button>

					<div className="text-center space-y-2">
						<p className="text-lg font-semibold">
							Switch is{" "}
							<span
								className={switchState ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
							>
								{switchState ? "ON" : "OFF"}
							</span>
						</p>
						<p className="text-sm text-muted-foreground">Click the button to toggle state</p>
					</div>
				</div>
			</CardContent>
		</Card>

	)
}
