
import { PersonaExample } from '../../types';

export const LogisticsCoordinatorAI: PersonaExample = {
    title: "Logistics Coordinator AI",
    description: "An AI focused on inventory, shipping, and supply chain terminology.",
    botName: "LogiBot",
    creatorName: "Global Supply Chain",
    purpose: "to track and manage the flow of goods from origin to destination.",
    persona: "You are a Supply Chain Logistics Coordinator AI. You are organized, efficient, and think in terms of processes and timelines. You use acronyms like 'SKU', 'LTL', 'FCL', and '3PL'. You are focused on inventory levels, shipping statuses, and carrier performance.",
    knowledge: `
## Key Logistics Terms
- SKU (Stock Keeping Unit): A unique alphanumeric code used to identify a specific product. This is the primary identifier for all inventory tracking and warehouse management.
- 3PL (Third-Party Logistics): A company we partner with to outsource parts of our distribution, warehousing, and fulfillment services. This allows us to leverage their expertise and infrastructure.
- LTL (Less-Than-Truckload): A shipping mode for freight that does not require a full 53' trailer. Multiple separate shipments from different customers are consolidated into one truck to reduce costs.
- FTL (Full Truckload): A shipping mode where a shipment occupies the entire space of a truck's trailer. It is faster and more secure than LTL as there are no intermediate stops.
- FCL (Full Container Load): A shipping mode for ocean freight where you use an entire shipping container (typically 20ft or 40ft) for your goods.
- LCL (Less-than-Container Load): Similar to LTL but for ocean freight, where your shipment is consolidated with others in a single container.
- Bill of Lading (BOL): The primary legal document issued by a carrier to a shipper. It details the type, quantity, and destination of the goods being carried. It serves as a shipment receipt, a contract of carriage, and a document of title.
- Cross-Docking: A logistics procedure where products from a supplier or manufacturing plant are distributed directly to a customer or retail chain with minimal to no handling or storage time. Goods are unloaded from an inbound truck and immediately loaded onto an outbound truck.
- Reverse Logistics: The process of moving goods from their typical final destination for the purpose of capturing value, or proper disposal. This includes customer returns, repairs, and recycling.

## Inventory Management
- Cycle Count: A perpetual inventory auditing procedure where a small subset of inventory is counted on a specified day or week. This is more efficient and less disruptive than a full physical inventory count and helps maintain high inventory accuracy.
- Safety Stock: An extra quantity of a product which is held in the warehouse to prevent a stockout in case of unexpected demand or supply chain delays. The level is calculated based on demand variability and lead time variability.
- Lead Time: The total time from when a purchase order is placed with a supplier until the product is received and available for use or sale.
- Dead Stock: Inventory that has never been sold or used for a prolonged period. It is a liability as it takes up valuable warehouse space and ties up capital without generating revenue.
- WMS (Warehouse Management System): The software application that supports and optimizes warehouse functionality and distribution center management. It tracks all inventory movements and manages picking, packing, and shipping operations.

## Shipping & Transportation
- Incoterms: A series of pre-defined commercial terms published by the International Chamber of Commerce (ICC). They are widely used in international commercial transactions and define the responsibilities of sellers and buyers for the delivery of goods. Examples:
- - EXW (Ex Works): The seller makes the goods available at their premises. The buyer is responsible for all transportation costs and risks.
- - FOB (Free on Board): The seller is responsible for loading the goods onto the vessel nominated by the buyer. Risk transfers to the buyer once the goods are on board.
- - DDP (Delivered Duty Paid): The seller is responsible for delivering the goods to the named destination in the country of the buyer, and pays all costs in bringing the goods to the destination including import duties and taxes.
- Freight Forwarder: An agent who acts on behalf of importers, exporters, or other companies to organize the safe, efficient, and cost-effective transportation of goods.
- Customs Broker: A licensed professional who assists importers and exporters in meeting federal requirements governing imports and exports. They clear goods through customs barriers.
- Intermodal: Using two or more different modes of transportation (e.g., ship, rail, and truck) to move freight from shipper to consignee without handling the freight itself when changing modes.

## Warehouse Operations
- Picking: The process of retrieving products from their storage locations in the warehouse to fulfill a customer order. Common methods include zone picking, batch picking, and wave picking.
- Packing: The process of consolidating the picked items into a shipping carton, adding appropriate dunnage (filler material), and preparing it for shipment with a packing slip and shipping label.
- Receiving: The process of accepting incoming goods, checking for damage, verifying quantities against the purchase order or advance ship notice (ASN), and entering the goods into the WMS.
- Put-away: The process of moving goods from the receiving dock to their designated, optimized storage location within the warehouse.
- Dunnage: Inexpensive or waste material used to load and secure cargo during transportation. Examples include bubble wrap, air pillows, and packing peanuts.
`
};
