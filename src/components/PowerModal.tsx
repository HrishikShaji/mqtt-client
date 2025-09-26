import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { PowerSensorType } from "@/types/sensor-types"
import { Settings2, Zap } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { formatValue } from "@/lib/utils"

interface Props {
	powerData: PowerSensorType;
	onChange: (field: string, value: any) => void;
	isConnected: boolean
}

export default function PowerModal({ isConnected, powerData, onChange }: Props) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline"><Settings2 /></Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Update Power Sensor</DialogTitle>
				</DialogHeader>
				<div className="space-y-6">
					{/* Voltage Slider */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label className="flex items-center gap-2">
								<Zap className="h-4 w-4" />
								Voltage
							</Label>
							<span className="text-sm font-medium">{formatValue(powerData.voltage)}V</span>
						</div>
						<Slider
							value={[powerData.voltage]}
							onValueChange={(value) => onChange("voltage", value[0])}
							max={300}
							min={100}
							step={0.1}
							disabled={!isConnected || !powerData.enabled}
							className="w-full"
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>100V</span>
							<span>300V</span>
						</div>
					</div>

					{/* Current Slider */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label>Current (A)</Label>
							<span className="text-sm font-medium">{formatValue(powerData.current, 2)}A</span>
						</div>
						<Slider
							value={[powerData.current]}
							onValueChange={(value) => onChange("current", value[0])}
							max={50}
							min={0}
							step={0.01}
							disabled={!isConnected || !powerData.enabled}
							className="w-full"
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>0A</span>
							<span>50A</span>
						</div>
					</div>

					{/* Power Slider */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label>Power (W)</Label>
							<span className="text-sm font-medium">{formatValue(powerData.power, 0)}W</span>
						</div>
						<Slider
							value={[powerData.power]}
							onValueChange={(value) => onChange("power", value[0])}
							max={10000}
							min={0}
							step={1}
							disabled={!isConnected || !powerData.enabled}
							className="w-full"
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>0W</span>
							<span>10kW</span>
						</div>
					</div>

					{/* Frequency Slider */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label>Frequency (Hz)</Label>
							<span className="text-sm font-medium">{formatValue(powerData.frequency, 2)}Hz</span>
						</div>
						<Slider
							value={[powerData.frequency]}
							onValueChange={(value) => onChange("frequency", value[0])}
							max={65}
							min={45}
							step={0.01}
							disabled={!isConnected || !powerData.enabled}
							className="w-full"
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>45Hz</span>
							<span>65Hz</span>
						</div>
					</div>

					{/* Power Factor Slider */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label>Power Factor</Label>
							<span className="text-sm font-medium">{formatValue(powerData.powerFactor, 3)}</span>
						</div>
						<Slider
							value={[powerData.powerFactor]}
							onValueChange={(value) => onChange("powerFactor", value[0])}
							max={1}
							min={0}
							step={0.001}
							disabled={!isConnected || !powerData.enabled}
							className="w-full"
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>0.000</span>
							<span>1.000</span>
						</div>
					</div>

					{/* Monitoring Toggle */}
					<div className="flex items-center space-x-2">
						<Switch
							id="monitoring"
							checked={powerData.monitoring}
							onCheckedChange={(checked) => onChange("monitoring", checked)}
							disabled={!isConnected || !powerData.enabled}
						/>
						<Label htmlFor="monitoring">Continuous monitoring</Label>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
