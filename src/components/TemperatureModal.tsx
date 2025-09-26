import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { TemperatureSensorType } from "@/types/sensor-types"
import { Droplets, MapPin, Send, Settings2, Thermometer } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select"
import { formatValue } from "@/lib/utils"

interface Props {
	temperatureData: TemperatureSensorType;
	onChange: (field: string, value: any) => void;
	isConnected: boolean
}

const locations = ["Living Room", "Kitchen", "Bedroom", "Bathroom", "Garage", "Basement", "Attic", "Outdoor"]

export default function TemperatureModal({ isConnected, temperatureData, onChange }: Props) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline"><Settings2 /></Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Update Sensor</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label className="flex items-center gap-2">
							<Thermometer className="h-4 w-4" />
							Temperature
						</Label>
						<span className="text-sm font-medium">{formatValue(temperatureData.temperature)}°C</span>
					</div>
					<Slider
						value={[temperatureData.temperature]}
						onValueChange={(value) => onChange("temperature", value[0])}
						max={45}
						min={-10}
						step={0.1}
						disabled={!isConnected || !temperatureData.enabled}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>-10°C</span>
						<span>45°C</span>
					</div>
				</div>

				{/* Humidity Slider */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label className="flex items-center gap-2">
							<Droplets className="h-4 w-4" />
							Humidity
						</Label>
						<span className="text-sm font-medium">{formatValue(temperatureData.humidity)}%</span>
					</div>
					<Slider
						value={[temperatureData.humidity]}
						onValueChange={(value) => onChange("humidity", value[0])}
						max={100}
						min={0}
						step={0.1}
						disabled={!isConnected || !temperatureData.enabled}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>0%</span>
						<span>100%</span>
					</div>
				</div>

				{/* Location Dropdown */}
				<div className="space-y-2">
					<Label className="flex items-center gap-2">
						<MapPin className="h-4 w-4" />
						Location
					</Label>
					<Select
						value={temperatureData.location}
						onValueChange={(value: string) => onChange("location", value)}
						disabled={!isConnected || !temperatureData.enabled}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{locations.map((location) => (
								<SelectItem key={location} value={location}>{location}</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Send className="h-3 w-3" />
					<span>Auto-publishes to sensors/temperature</span>
				</div>

			</DialogContent>
		</Dialog>
	)
}
