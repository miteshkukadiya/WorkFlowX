import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";

import {
    notificationService
} from "../services/notificationService";

import {
    useAuth
} from "./AuthContext";


const NotificationContext =
    createContext(null);


export const NotificationProvider = ({
    children
}) => {

    const {
        user
    } = useAuth();


    const [
        notifications,
        setNotifications
    ] = useState([]);

    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);

    const [
        loading,
        setLoading
    ] = useState(false);


    const loadNotifications =
        useCallback(async () => {

            if (!user) {

                setNotifications([]);
                setUnreadCount(0);

                return;

            }


            try {

                setLoading(true);


                const [
                    notificationData,
                    count
                ] = await Promise.all([

                    notificationService
                        .getAll(),

                    notificationService
                        .getUnreadCount()

                ]);


                setNotifications(
                    notificationData
                );

                setUnreadCount(
                    count
                );


            } catch (error) {

                console.error(
                    "Notification load error:",
                    error
                );

            } finally {

                setLoading(false);

            }

        }, [user]);


    useEffect(() => {

        loadNotifications();

    }, [loadNotifications]);


    const markAsRead =
        async (id) => {

            const notification =
                notifications.find(
                    (item) =>
                        item._id === id
                );


            if (
                !notification ||
                notification.isRead
            ) {
                return;
            }


            await notificationService
                .markAsRead(id);


            setNotifications(
                (previous) =>
                    previous.map(
                        (item) =>
                            item._id === id
                                ? {
                                    ...item,
                                    isRead: true,
                                    readAt:
                                        new Date()
                                            .toISOString()
                                }
                                : item
                    )
            );


            setUnreadCount(
                (previous) =>
                    Math.max(
                        0,
                        previous - 1
                    )
            );

        };


    const markAllAsRead =
        async () => {

            await notificationService
                .markAllAsRead();


            setNotifications(
                (previous) =>
                    previous.map(
                        (item) => ({
                            ...item,
                            isRead: true,
                            readAt:
                                item.readAt ||
                                new Date()
                                    .toISOString()
                        })
                    )
            );


            setUnreadCount(0);

        };


    const removeNotification =
        async (id) => {

            const notification =
                notifications.find(
                    (item) =>
                        item._id === id
                );


            await notificationService
                .delete(id);


            setNotifications(
                (previous) =>
                    previous.filter(
                        (item) =>
                            item._id !== id
                    )
            );


            if (
                notification &&
                !notification.isRead
            ) {

                setUnreadCount(
                    (previous) =>
                        Math.max(
                            0,
                            previous - 1
                        )
                );

            }

        };


    return (

        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                loadNotifications,
                markAsRead,
                markAllAsRead,
                removeNotification
            }}
        >

            {children}

        </NotificationContext.Provider>

    );

};


export const useNotifications = () => {

    const context =
        useContext(
            NotificationContext
        );


    if (!context) {

        throw new Error(
            "useNotifications must be used inside NotificationProvider"
        );

    }


    return context;

};