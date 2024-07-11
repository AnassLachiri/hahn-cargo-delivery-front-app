import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import Header from '../../components/Header';
import './Home.css';

interface Order {
    id: number;
    originNodeId: number;
    targetNodeId: number;
    load: number;
    value: number;
    deliveryDateUtc: string;
    expirationDateUtc: string;
}

interface TransporterInfo {
    id: number;
    orders: Order[];
    remainingPath: number[];
}

interface SimulationState {
    isSimulationStarted: boolean;
    grid: any;  // Define the grid type as per your requirements
    transporters: TransporterInfo[];
    coinAmount: number;
    deliveredOrders: Order[];
}

const Home: React.FC = () => {
    const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            fetchSimulationState();
        }
    }, [navigate]);

    const fetchSimulationState = async () => {
        try {
            const response = await axiosInstance.get('/Sim/GetSimulationState');
            setSimulationState(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching simulation state:', error);
            setIsLoading(false);
        }
    };

    const handleStartStopSimulation = async () => {
        try {
            if (simulationState?.isSimulationStarted) {
                await axiosInstance.post('/Sim/StopSimulation');
            } else {
                await axiosInstance.post('/Sim/StartSimulation');
            }
            fetchSimulationState();
        } catch (error) {
            console.error('Error starting/stopping simulation:', error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Header />
            <div className="home-container">
                
                <h1>Simulation {simulationState?.isSimulationStarted ? "On" : "Off"}</h1>
                <button onClick={handleStartStopSimulation}>
                    {simulationState?.isSimulationStarted ? 'Stop Simulation' : 'Start Simulation'}
                </button>
                <button onClick={fetchSimulationState}>
                    Refresh
                </button>
                <div>
                    <h2>Amount</h2>
                    <div>{simulationState?.coinAmount}</div>
                </div>
                <div>
                    <h2>Transporters</h2>
                    <div className='transporters-container'>
                        {simulationState?.transporters.map(transporter => (
                            <>
                            <h3 key={transporter.id}>
                                Transporter {transporter.id} with {transporter.orders.length} orders
                            </h3>
                            <div className='transporters-container'>
                                <h3>Orders :</h3>
                                {transporter.orders.map(order => <div>Id: {order.id} - OriginNodeId :{order.originNodeId} - targetNodeId :{order.targetNodeId} - Load :{order.load} - Value :{order.value} </div>)}
                                <h3>Path :</h3>
                                {transporter.remainingPath.map(node => node + " - ")}
                            </div>
                            </>
                        ))}
                    </div>
                </div>
                <hr></hr>
                <div>
                    <h2>All delivered orders : </h2>
                    {simulationState?.deliveredOrders.map(order => <div>Id: {order.id} - OriginNodeId :{order.originNodeId} - targetNodeId :{order.targetNodeId} - Load :{order.load} - Value :{order.value} </div>)}
                </div>
            </div>
        </div>
    );
};

export default Home;
