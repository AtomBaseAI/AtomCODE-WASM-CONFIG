

export const RankAnimation = ({ rank }: { rank: any }) => {
    return (
        <div className="rank-container">
            <span className={`rankanimatesurface r${rank}x rankanimation`}></span>
            <span className={`rankanimatesurface r${rank}x rankanimation2`}></span>
            <span className={`rankanimatesurface r${rank}x`}>{rank}</span>
        </div>
    )
}

