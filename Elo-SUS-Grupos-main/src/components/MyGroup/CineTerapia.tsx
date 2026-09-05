import React, { useEffect, useState } from 'react';
import { Play, Film } from 'lucide-react';
import { youtubeService, VideoResult } from '../../services/youtubeService';

const CineTerapia: React.FC = () => {
    const [video, setVideo] = useState<VideoResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const data = await youtubeService.getDailyVideo();
                setVideo(data);
            } catch (error) {
                console.error('Failed to load daily video', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-64 bg-white/50 rounded-2xl animate-pulse flex items-center justify-center">
                <Film className="text-slate-300 w-12 h-12" />
            </div>
        );
    }

    if (!video) return null;

    return (
        <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-sm mb-8 relative overflow-hidden group">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-blue-50 rounded-full blur-3xl -z-10 opacity-50"></div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Video Container */}
                <div className="w-full md:w-1/2 lg:w-5/12 relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-black group-hover:shadow-xl transition-all duration-300">
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${video.id}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    ></iframe>
                </div>

                {/* Content */}
                <div className="flex-1 py-2">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Film size={20} />
                        </div>
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Cine Terapia</span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-3 leading-tight">
                        {video.title}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {video.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                            <Play size={14} className="fill-current" />
                            Inspiração do Dia
                        </span>
                        <span>•</span>
                        <span>Atualizado diariamente</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CineTerapia;
