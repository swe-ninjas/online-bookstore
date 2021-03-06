<template>
    <div>
        <div id="new-booking">
            <div class="card">
                <div class="card-body pending-booking">
                    <div class="card-text">
                        <h1>Pending for reviews</h1>
                        <hr />
                        <div v-if="pending.length === 0"> No pending requests</div>
                        <div v-for="booking in pending" :key="booking.id">
                            <div class="clearfix">
                                <div class="float-left">
                                    <b>{{ booking.user.name }}</b> requested for {{ booking.quantity }} cop{{ booking.quantity > 1 ? 'ies' : 'y' }}
                                </div>
                                <div class="float-right">
                                    <button class="btn btn-sm btn-success" @click="approve(booking.id)">Approve</button>
                                    <button class="btn btn-sm btn-danger" @click="cancel(booking.id)" >Cancel</button>
                                    <button class="btn btn-sm btn-primary" @click="update(booking.id, booking.quantity + 1)">Add one</button>
                                    <button class="btn btn-sm btn-primary" @click="update(booking.id, booking.quantity - 1)">Remove one</button>
                                </div>
                            </div>
                            <hr />
                        </div>
                    </div>
                </div>

                <div class="card-body approved-booking">
                    <div class="card-text">
                        <h1>Approved</h1>
                        <hr />
                        <div v-for="booking in approved" :key="booking.id" class="clearfix">
                            <b>{{ booking.user.name }}</b>'s request for {{ booking.quantity }} cop{{ booking.quantity > 1 ? 'ies' : 'y' }} is approved
                            <hr />
                        </div>
                    </div>
                </div>

                <div class="card-body cancelled-booking">
                    <div class="card-text">
                        <h1>Cancelled</h1>
                        <div v-for="booking in cancelled" :key="booking.id" class="clearfix">
                            <b>{{ booking.user.name }}</b>'s request for {{ booking.quantity }} cop{{ booking.quantity > 1 ? 'ies' : 'y' }} has been cancelled
                            <hr />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['book'],

    data () {
        return {
            pending: [],
            cancelled: [],
            approved: []
        };
    },

    mounted () {
        this.fetchBookings();
    },

    methods: {
        async fetchBookings () {
            try {
                let response = await this.$http.get(`/books/${this.book.id}/bookings`);
                let bookings = response.data.bookings;
                bookings.sort((a, b) => {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                });

                // Extract necessary data from booking object
                bookings = bookings.map((booking) => {
                    return {
                        id: booking._id,
                        user_id: booking.user_id,
                        quantity: booking.quantity,
                        status: booking.status
                    };
                });

                // List all user IDs
                let userIDs = bookings.map((booking) => {
                    return booking.user_id;
                });

                // Find unique id's of users.
                userIDs = [...new Set(userIDs)];

                // Create promise array of HTTP requests
                // for fetching user's information
                userIDs = userIDs.map((id) => {
                    return this.$http.get(`/users/${id}`);
                });

                // Create a map {id => userObject}
                let userMap = {};
                for (let p of userIDs) {
                    let response = await p;
                    userMap[response.data.user._id] = response.data.user;
                };

                // Replace userID with user object using the previous map
                bookings = bookings.map((booking) => {
                    return {
                        id: booking.id,
                        user: userMap[booking.user_id],
                        quantity: booking.quantity,
                        status: booking.status
                    };
                });

                // Now we will to update states of the component
                this.pending = bookings.filter((booking) => {
                    return booking.status === 'pending';
                });

                this.cancelled = bookings.filter((booking) => {
                    return booking.status === 'cancelled';
                });

                this.approved = bookings.filter((booking) => {
                    return booking.status === 'approved';
                });
            } catch (err) {
                this.$notify({
                    text: 'Something went wrong',
                    type: 'error'
                });
            }
        },

        approve (bookingID) {
            // Approve the booking
            this.$http.patch(`/books/bookings/${bookingID}`, {
                status: 'approved'
            }).then(() => {
                this.fetchBookings();
            });
        },

        update (bookingID, quantity) {
            // Update booking with new quantity
            this.$http.patch(`/books/bookings/${bookingID}`, {
                quantity
            }).then(() => {
                this.fetchBookings();
            });
        },

        cancel (bookingID) {
            // Cancel the booking
            this.$http.patch(`/books/bookings/${bookingID}`, {
                status: 'cancelled'
            }).then(() => {
                this.fetchBookings();
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.btn {
    margin-right: 10px;
}
</style>
