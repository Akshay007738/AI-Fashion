import React, { useState, useCallback } from 'react';
import { AppState, Gender, Occasion } from './types';
import type { AnalysisResult } from './types';
import CameraView from './components/CameraView';
import AnalysisView from './components/AnalysisView';
import Spinner from './components/Spinner';
import MaleIcon from './components/icons/MaleIcon';
import FemaleIcon from './components/icons/FemaleIcon';
import { analyzeClothingAndRecommend, generateRecommendedItemImage } from './services/geminiService';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [recommendedItemImages, setRecommendedItemImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
    const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);

    const handleCapture = useCallback(async (imageData: string) => {
        if (!selectedGender || !selectedOccasion) {
            setError("Please select a gender and occasion before capturing.");
            setAppState(AppState.ERROR);
            return;
        }

        setCapturedImage(imageData);
        setAppState(AppState.ANALYZING);
        setError(null);

        try {
            setLoadingMessage('Analyzing your style...');
            const analysis = await analyzeClothingAndRecommend(imageData, selectedGender, selectedOccasion);
            setAnalysisResult(analysis);

            if (analysis.recommendations && analysis.recommendations.length > 0) {
                setLoadingMessage(`Creating ${analysis.recommendations.length} recommendations...`);

                const imagePromises = analysis.recommendations.map(item =>
                    generateRecommendedItemImage(item.itemName)
                );

                const images = await Promise.all(imagePromises);
                setRecommendedItemImages(images);
            }

            setAppState(AppState.SHOWING_RESULT);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to get recommendation. Please try again. Details: ${errorMessage}`);
            setAppState(AppState.ERROR);
        }
    }, [selectedGender, selectedOccasion]);

    const handleReset = useCallback(() => {
        setAppState(AppState.IDLE);
        setCapturedImage(null);
        setAnalysisResult(null);
        setRecommendedItemImages([]);
        setError(null);
        setLoadingMessage('');
        setSelectedGender(null);
        setSelectedOccasion(null);
    }, []);

    const renderContent = () => {
        switch (appState) {
            case AppState.IDLE:
                const isSelectionComplete = selectedGender && selectedOccasion;
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <h1 className="text-4xl md:text-6xl font-bold mb-2 text-white">AI Fashion Stylist</h1>
                        <p className="text-lg text-gray-300 mb-8 max-w-2xl">
                            Select your gender and an occasion for personalized style recommendations.
                        </p>

                        <div className="w-full max-w-md mx-auto">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-teal-400 mb-3">Gender</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setSelectedGender(Gender.MALE)} className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${selectedGender === Gender.MALE ? 'border-teal-500 bg-teal-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
                                        <MaleIcon className={`w-8 h-8 ${selectedGender === Gender.MALE ? 'text-teal-400' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${selectedGender === Gender.MALE ? 'text-white' : 'text-gray-300'}`}>Male</span>
                                    </button>
                                    <button onClick={() => setSelectedGender(Gender.FEMALE)} className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${selectedGender === Gender.FEMALE ? 'border-teal-500 bg-teal-500/10' : 'border-gray-600 hover:border-gray-500'}`}>
                                        <FemaleIcon className={`w-8 h-8 ${selectedGender === Gender.FEMALE ? 'text-teal-400' : 'text-gray-400'}`} />
                                        <span className={`font-semibold ${selectedGender === Gender.FEMALE ? 'text-white' : 'text-gray-300'}`}>Female</span>
                                    </button>
                                </div>
                            </div>

                             <div className="mb-8">
                                <h2 className="text-xl font-semibold text-teal-400 mb-3">Occasion</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {Object.values(Occasion).map(occ => (
                                        <button key={occ} onClick={() => setSelectedOccasion(occ)} className={`p-3 border-2 rounded-lg transition-all text-sm font-semibold ${selectedOccasion === occ ? 'border-teal-500 bg-teal-500/10 text-white' : 'border-gray-600 hover:border-gray-500 text-gray-300'}`}>
                                            {occ}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setAppState(AppState.CAMERA_ACTIVE)}
                            disabled={!isSelectionComplete}
                            className="bg-teal-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            Start Your Style Analysis
                        </button>
                    </div>
                );
            case AppState.CAMERA_ACTIVE:
                return <CameraView onCapture={handleCapture} />;
            case AppState.ANALYZING:
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Spinner />
                        <p className="text-xl mt-4 text-gray-300 animate-pulse">{loadingMessage}</p>
                    </div>
                );
            case AppState.SHOWING_RESULT:
                if (capturedImage && analysisResult && recommendedItemImages.length > 0 && selectedGender && selectedOccasion) {
                    return (
                        <AnalysisView
                            capturedImage={capturedImage}
                            analysis={analysisResult}
                            recommendedItemImages={recommendedItemImages}
                            onReset={handleReset}
                            gender={selectedGender}
                            occasion={selectedOccasion}
                        />
                    );
                }
                handleReset();
                return null;
            case AppState.ERROR:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Oops! An Error Occurred.</h2>
                        <p className="text-gray-300 mb-6 max-w-md">{error}</p>
                        <button
                            onClick={handleReset}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-7xl h-[90vh] bg-gray-800 rounded-2xl shadow-2xl relative overflow-hidden flex items-center justify-center">
                {renderContent()}
            </div>
        </main>
    );
};

export default App;