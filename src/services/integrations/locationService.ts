export const locationService = {
    /**
     * Opens Google Maps directions to the specified address.
     * @param address The destination address.
     */
    openRoute: (address: string) => {
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    }
};
